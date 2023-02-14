import type { NextPage } from "next";
import dateFormat from "dateformat";
import { useEffect, useState } from "react";
import { CSVLink, CSVDownload } from "react-csv";
import { wilayas } from "../data/wilayas";
import { communesList } from "../data/communes";
import { communesStopdesk } from "../data/communesStopdesk";
import { fees } from "../data/fees";
import { agencies } from "../data/agencies";
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
    if (isStopDesk === false) setAgency("");
  }, [isStopDesk]);
  const handleAddOrder = () => {
    setOrders([
      ...orders,
      {
        firstName,
        lastName,
        phone,
        address,
        wilaya,
        commune,
        isStopdesk: isStopDesk,
        agency,
        totalPrice: productPrice + shippingPrice,
      },
    ]);
    setFirstName("");
    setLastName("");
    setPhone("");
    setAddress("");
    setWilaya("");
    setCommune("");
    setIsStopDesk(false);
    setAgency("");
    setProductPrice(0);
    setShippingPrice(0);
  };

  return (
    <div>
      <h1 className="text-5xl font-bold mx-10 capitalize text-center mb-6">
        Order filler 1.0
      </h1>
      <hr />
      <div className="mx-10">
        <div className="my-6 grid grid-cols-4 gap-4">
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
              <span className="label-text">Wilayas</span>
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
            {wilaya && (
              <label className="label">
                <span className="label-text-alt">
                  Estimated fees: {deliveryFee} DA
                </span>
              </label>
            )}
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
            <div className="mt-4">
              <button className="btn btn-primary" onClick={handleAddOrder}>
                Add Order
              </button>
            </div>
          </div>
        </div>
        <div className="flex items-center"></div>
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th></th>
                <th>Firstname</th>
                <th>Lastname</th>
                <th>Phone</th>
                <th>Address</th>
                <th>Commune</th>
                <th>Wilaya</th>
                <th>Stopdesk</th>
                <th>Order number</th>
                <th>Product</th>
                <th>Total price</th>
                <th>Free shipping</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order: any, i: number) => (
                <tr key={i}>
                  <th>{i}</th>
                  <td>{order.firstName}</td>
                  <td>{order.lastName}</td>
                  <td>{order.phone}</td>
                  <td>{order.address}</td>
                  <td>{order.commune}</td>
                  <td>{order.wilaya}</td>
                  <td>{order.isStopdesk && order.agency}</td>
                  <td>{Math.floor(Math.random() * 1000)}</td>
                  <td>x</td>
                  <td>{order.totalPrice}</td>
                  <td>OUI</td>
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
