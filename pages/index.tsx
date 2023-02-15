import type { NextPage } from "next";
import dateFormat from "dateformat";
import { useEffect, useState, useRef } from "react";
import Papa from "papaparse";
import { CSVLink, CSVDownload } from "react-csv";
import { wilayas } from "../data/wilayas";
import { communesList } from "../data/communes";
import { communesStopdesk } from "../data/communesStopdesk";
import { fees } from "../data/fees";
import { agencies } from "../data/agencies";
import supabase from "../supabaseClient";

const statusColors = {
  initial: "bg-neutral-600",
  canceled: "bg-red-600",
  confirmed: "bg-green-600",
  "not-responding": "bg-yellow-600",
  unreachable: "bg-amber-600",
  busy: "bg-yellow-600",
  reported: "bg-violet-600",
  other: "bg-indigo-600",
};

const Home: NextPage = () => {
  const [leads, setLeads] = useState<any>([]);
  const [leadsCsv, setLeadsCsv] = useState<any>([]);
  const [shippingPrice, setShippingPrice] = useState(0);
  const [productPrice, setProductPrice] = useState(0);
  const [isStopDesk, setIsStopDesk] = useState(false);
  const [deliveryFee, setDeliveryFee] = useState(null);
  const [agency, setAgency] = useState("");
  const [communes, setCommunes] = useState([]);
  const [commune, setCommune] = useState("");
  const [wilaya, setWilaya] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [orders, setOrders] = useState<any>([]);
  const [uploading, setUploading] = useState(false);
  const [currentId, setCurrentId] = useState();
  const [currentStatus, setCurrentStatus] = useState("");
  const [comment, setComment] = useState("");
  const [wilayaIn, setWilayaIn] = useState("");
  const [uploaded, setUploaded] = useState(false);
  const inputRef = useRef();

  const handleUploadCSV = async () => {
    setUploading(true);

    const input: any = inputRef?.current;
    const reader = new FileReader();
    const [file] = input.files;

    reader.onloadend = async ({ target }: any) => {
      const csv = Papa.parse(target.result, { header: true });
      try {
        for (let item of csv.data) {
          const phone = item.phone_number
            ? item.phone_number.replace("p:", "")
            : "";
          console.log("the phone is ", phone);
          const createdTime = item.created_time;
          const fullName = item.full_name;
          const wilaya = item.state;
          const address = item.street_address;
          if (fullName && wilaya && phone) {
            const { error } = await supabase.from("fb-lead").insert({
              first_name: fullName,
              last_name: "",
              wilaya_in: wilaya,
              wilaya: "",
              commune: "",
              address,
              phone,
              created_time: createdTime,
            });
            if (error) {
              console.log("something went wrong wth record");
            }
            setUploading(false);
            setUploaded(true);
          }
        }
      } catch (error) {
        console.log(error);
      }
      console.log(csv);
    };

    reader.readAsText(file);
  };
  useEffect(() => {
    if (wilaya !== "") {
      console.log("wilaya", wilayas);
      console.log("communes", communesStopdesk[wilaya]);
      console.log("communes", communesList[wilaya]);
      if (isStopDesk) {
        setCommunes(communesStopdesk[wilaya]);
        console.log("fee: ", fees[wilaya].deskFee);
        setDeliveryFee(fees[wilaya].deskFee);
      } else {
        setCommunes(communesList[wilaya]);
        console.log("fee: ", fees[wilaya].homeFee);
        setDeliveryFee(fees[wilaya].homeFee);
      }
    }
  }, [wilaya, isStopDesk]);

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const { data, error } = await supabase
          .from("fb-lead")
          .select("*")
          .order("created_time", { ascending: false });

        if (data) {
          console.log("the data: ", data);

          setOrders(data);
        }

        if (error) {
          console.log(error);
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchLeads();
  }, []);

  useEffect(() => {
    const fetchConfirmed = async () => {
      try {
        const { data, error } = await supabase
          .from("fb-lead")
          .select("*")
          .eq("status", "confirmed");
        if (data) {
          let csv: any = [];
          data.map((lead: any) => {
            csv = [
              ...csv,
              [
                lead.first_name,
                lead.last_name,
                lead.phone,
                lead.address,
                lead.commune,
                lead.wilaya,
                lead.is_stopdesk ? lead.stopdesk : "",
                Math.floor(Math.random() * 1000),
                "",
                lead.price,
                "OUI",
              ],
            ];
          });
          console.log(csv);
          setLeadsCsv(csv);
        }

        if (error) {
          console.log(error);
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchConfirmed();
  }, []);
  useEffect(() => {
    if (isStopDesk === false) setAgency("");
  }, [isStopDesk]);
  const handleAddOrder = async () => {
    try {
      if (currentStatus === "confirmed") {
        const { error } = await supabase
          .from("fb-lead")
          .update({
            first_name: firstName,
            last_name: lastName,
            phone,
            address,
            wilaya,
            commune,
            is_stopdesk: isStopDesk,
            stopdesk: agency,
            price: productPrice + shippingPrice,
            status: currentStatus,
            comment,
          })
          .eq("id", currentId);
        if (error) {
          console.log(error);
        }
      } else {
        const { error } = await supabase
          .from("fb-lead")
          .update({
            status: currentStatus,
            comment,
          })
          .eq("id", currentId);
        if (error) {
          console.log(error);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      <h1 className="text-5xl font-bold mx-10 capitalize text-center mb-6">
        Order filler 1.0
      </h1>
      <hr />
      <div className="mx-10 grid grid-cols-2">
        <div className="my-6">
          <h4 className="page-header mb-4">Import leads</h4>
          <div className="mb-4">
            <input
              ref={inputRef}
              disabled={uploading}
              type="file"
              className="file-input file-input-ghost w-full max-w-xs"
            />
          </div>
          <button
            onClick={handleUploadCSV}
            disabled={uploading}
            className="btn btn-primary"
          >
            {uploading ? "Importing..." : "Import"}
          </button>
        </div>

        <div className="flex items-center">
          <CSVLink className="btn btn-success" data={leadsCsv}>
            Download Orders
          </CSVLink>
        </div>
      </div>
      {uploaded && (
        <div className="mx-10 mb-6">
          <div className="alert alert-success shadow-sm">
            <div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="stroke-current flex-shrink-0 h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>Your data has been successfully imported</span>
            </div>
          </div>
        </div>
      )}

      <hr />

      <div className="mx-10">
        {currentId && (
          <>
            <div className="my-6 grid grid-cols-4 gap-4">
              <div className="form-control w-full max-w-xs">
                <label className="label">
                  <span className="label-text">Status</span>
                </label>
                <select
                  className="select w-full max-w-xs"
                  onChange={(e) => setCurrentStatus(e.target.value)}
                  value={currentStatus}
                >
                  <option disabled selected>
                    Pick a status
                  </option>
                  <option value="initial">Initial</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="not-responding">Not Responding</option>
                  <option value="unreachable">Unreachable</option>
                  <option value="canceled">canceled</option>
                  <option value="busy">busy</option>
                  <option value="reported">Reported</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="form-control w-full max-w-xs">
                <label className="label">
                  <span className="label-text">Comment</span>
                </label>

                <input
                  type="text"
                  onChange={(e) => setComment(e.target.value)}
                  value={comment}
                  placeholder="Comment"
                  className="input input-bordered w-full max-w-xs"
                />
              </div>
              <div></div>
              <div></div>
              {currentStatus === "confirmed" && (
                <>
                  <div className="form-control w-full max-w-xs">
                    <label className="label">
                      <span className="label-text">First name</span>
                    </label>

                    <input
                      type="text"
                      onChange={(e) => setFirstName(e.target.value)}
                      value={firstName}
                      placeholder="First name"
                      className="input input-bordered w-full max-w-xs"
                    />
                  </div>
                  <div className="form-control w-full max-w-xs">
                    <label className="label">
                      <span className="label-text">Last name</span>
                    </label>

                    <input
                      type="text"
                      onChange={(e) => setLastName(e.target.value)}
                      value={lastName}
                      placeholder="First name"
                      className="input input-bordered w-full max-w-xs"
                    />
                  </div>
                  <div className="form-control w-full max-w-xs">
                    <label className="label">
                      <span className="label-text">Phone number</span>
                    </label>

                    <input
                      type="text"
                      onChange={(e) => setPhone(e.target.value)}
                      value={phone}
                      placeholder="Phone number"
                      className="input input-bordered w-full max-w-xs"
                    />
                  </div>
                  <div className="form-control w-full max-w-xs">
                    <label className="label">
                      <span className="label-text">Address</span>
                    </label>

                    <input
                      type="text"
                      onChange={(e) => setAddress(e.target.value)}
                      value={address}
                      placeholder="Address"
                      className="input input-bordered w-full max-w-xs"
                    />
                  </div>
                  <div className="form-control w-full max-w-xs">
                    <label className="label">
                      <span className="label-text">Stopdesk</span>
                    </label>

                    <input
                      type="checkbox"
                      className="toggle toggle-lg"
                      checked={isStopDesk}
                      onChange={(e) => setIsStopDesk(e.target.checked)}
                    />
                  </div>
                  <div className="form-control w-full max-w-xs">
                    <label className="label">
                      <span className="label-text">Wilaya</span>
                    </label>

                    <select
                      className="select w-full max-w-xs"
                      onChange={(e) => setWilaya(e.target.value)}
                    >
                      <option disabled selected>
                        Pick your wilayas
                      </option>
                      {wilayas.map((wil: any, i: number) => (
                        <option key={i} value={wil.value}>
                          {wil.label}
                        </option>
                      ))}
                    </select>
                    <label className="label">
                      <span className="label-text">{wilayaIn}</span>
                      {wilaya && (
                        <span className="label-text-alt">
                          Estimated fees: {deliveryFee} DA
                        </span>
                      )}
                    </label>
                  </div>
                  <div className="form-control w-full max-w-xs">
                    <label className="label">
                      <span className="label-text">Commune</span>
                    </label>

                    <select
                      className="select w-full max-w-xs"
                      onChange={(e) => setCommune(e.target.value)}
                    >
                      <option disabled selected>
                        Pick your commune
                      </option>
                      {communes.map((com: any, i: number) => (
                        <option key={i} value={com.value}>
                          {com.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    {isStopDesk && commune && (
                      <div className="form-control w-full max-w-xs">
                        <label className="label">
                          <span className="label-text">Agency</span>
                        </label>

                        <select
                          className="select w-full max-w-xs"
                          onChange={(e) => setAgency(e.target.value)}
                        >
                          <option disabled selected>
                            Pick your agency
                          </option>
                          {agencies[commune] && (
                            <option value={agencies[commune].value}>
                              {agencies[commune].label}
                            </option>
                          )}
                        </select>
                      </div>
                    )}
                  </div>
                  <div className="form-control w-full max-w-xs">
                    <label className="label">
                      <span className="label-text">Product price</span>
                    </label>

                    <input
                      type="number"
                      onChange={(e) => setProductPrice(+e.target.value)}
                      value={productPrice}
                      placeholder="Product price"
                      className="input input-bordered w-full max-w-xs"
                    />
                    <label className="label">
                      <span className="label-text-alt">
                        Product price: {productPrice} DA
                      </span>
                    </label>
                  </div>
                  <div className="form-control w-full max-w-xs">
                    <label className="label">
                      <span className="label-text">Shipping price</span>
                    </label>

                    <input
                      type="number"
                      onChange={(e) => setShippingPrice(+e.target.value)}
                      value={shippingPrice}
                      placeholder="Shipping price"
                      className="input input-bordered w-full max-w-xs"
                    />
                    <label className="label">
                      <span className="label-text-alt">
                        Shipping price: {shippingPrice} DA
                      </span>
                    </label>
                  </div>
                  <div className="stat">
                    <div className="stat-title">Total Price</div>
                    <div className="stat-value">
                      {(productPrice + shippingPrice).toFixed(2)} DA
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="mt-4">
              <button className="btn btn-primary" onClick={handleAddOrder}>
                Add Order
              </button>
            </div>
          </>
        )}
        <div className="flex items-center"></div>
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th></th>
                <th>Firstname</th>
                <th>Phone</th>
                <th>Address</th>
                <th>Wilaya</th>
                <th>Created at</th>
                <th>status</th>
                <th>comment</th>
                <th>Edit</th>
              </tr>
            </thead>
            {/* {console.log("my data:", data)} */}
            <tbody>
              {orders.map((order: any, i: number) => (
                <tr key={i}>
                  <th>{i}</th>
                  <td>{order.first_name}</td>
                  <td>{order.phone}</td>
                  <td>{order.address}</td>
                  <td>{order.wilaya_in}</td>
                  <td>
                    {order.created_time.replace("T", " ").replace("+01:00", "")}
                  </td>
                  <td>
                    <div
                      className={`badge badge-lg border-0 text-white ${
                        statusColors[order.status]
                      }`}
                    >
                      {order.status}
                    </div>
                  </td>
                  <td>{order.comment && order.comment}</td>
                  <td>
                    <button
                      onClick={() => {
                        setCurrentId(order.id);
                        setWilayaIn(order.wilaya_in);
                        setCurrentStatus(order.status);
                        setAddress(order.address);
                        setFirstName(order.first_name);
                        setPhone(order.phone);
                        console.log("new order: ", order.id);
                      }}
                      className="btn btn-active"
                    >
                      Edit
                    </button>
                  </td>
                  {/* <td>{order.isStopdesk && order.agency}</td>
                  <td>{Math.floor(Math.random() * 1000)}</td> */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Home;
