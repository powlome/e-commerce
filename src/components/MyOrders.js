import React, { useEffect, useState } from "react";
import { Spinner, Table, Button } from "react-bootstrap";
import toast, { Toaster } from "react-hot-toast";
import Swal from "sweetalert2";
import useContexts from "../hooks/useContexts.js";
import StripeCheckout from "react-stripe-checkout";
import axios from "axios";
// import { ToastContainer, toast } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";

const Orders = () => {
  const { email } = useContexts();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPaid, setIsPaid] = useState(false);

  //payment
  // const [product] = React.useState({
  //   name: "Tesla Roadster",
  //   price: 64998.67,
  //   description: "Cool car",
  // });

  async function handleToken(token, addresses, order) {
    const product = {
      id: order._id,
      name: order.name,
      price: order.price,
      description: order.desc,
    };
    const response = await axios.post(
      "https://server-etechouse.herokuapp.com/checkout",
      {
        token,
        product,
      }
    );
    const { status } = response.data;

    if (status === "success") {
      await axios.put(
        "https://server-etechouse.herokuapp.com/checkout/update",
        {
          id: order._id,
        }
      );
      setIsPaid(true);
      toast("Success! Check email for details", { type: "success" });
    } else {
      toast("Something went wrong", { type: "error" });
    }
  }
  ////

  useEffect(() => {
    fetch(`https://server-etechouse.herokuapp.com/orders?email=${email}`)
      .then((res) => res.json())
      .then((data) => {
        setOrders(data);
        setLoading(false);
      })
      .catch((error) => toast.error(error.message));
  }, [email]);

  const deletion = (id) => {
    Swal.fire({
      icon: "warning",
      title: "Are you sure to delete this order?",
      showCancelButton: true,
      confirmButtonText: "Yes",
    }).then((result) => {
      if (result.isConfirmed) {
        fetch(`https://server-etechouse.herokuapp.com/placeorder/${id}`, {
          method: "DELETE",
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.deletedCount) {
              const modifiedOrders = orders.filter((order) => order._id !== id);
              setOrders(modifiedOrders);
              Swal.fire("Deleted!", "", "success");
            }
          });
      }
    });
  };

  return (
    <div className="px-2  mx-md-2 bg-white" style={{ borderRadius: "15px" }}>
      <h3 className="text-center fw-bold mb-4">My orders</h3>
      {loading ? (
        <div className="text-center my-5 private-spinner py-5">
          <Spinner variant="danger" animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <h6>Loading...</h6>
        </div>
      ) : (
        <Table className="myOrder" hover borderless responsive>
          <Toaster position="bottom-left" reverseOrder={false} />
          <thead className="bg-light">
            <tr>
              <th>Image</th>
              <th>Product</th>
              <th>Brands</th>
              <th>Status</th>
              <th>Payment Status</th>
              <th>Deletion</th>
            </tr>
          </thead>
          {orders.map((order) => {
            return (
              <tbody key={order._id} style={{ fontWeight: "500" }}>
                <tr>
                  <td>
                    <img width="100px" src={order.img} alt="" />
                  </td>
                  <td>{order.title}</td>
                  <td title={order.desc}>{order.desc.slice(0, 50)}</td>

                  <td>
                    <button
                      style={{ width: "100px" }}
                      className={
                        order.status === "Pending"
                          ? "btn btn-danger"
                          : order.status === "Done"
                          ? "btn btn-success"
                          : "btn btn-info"
                      }
                    >
                      {order.status}
                    </button>
                  </td>
                  <td>
                    {order.isPaid || isPaid ? (
                      <Button variant="success" className="pt-1 px-3 ml-3 mb-0">
                        Paid
                      </Button>
                    ) : (
                      <StripeCheckout
                        stripeKey="pk_test_51KD7J8JE5np8TvxNHHRjevr0oNldrIZh285T3ZRyH9YKxcz2MCY2K3v9itnFnF6Jf9pyW8vVTCfpz0jDGlZYP0Vo00r1NmEmJD"
                        token={(token, addresses) =>
                          handleToken(token, addresses, order)
                        }
                        amount={order.price * 100}
                        name={order.title}
                        billingAddress
                        shippingAddress
                      />
                    )}

                    {/* <Button
                      variant="outline-success"
                      className="p-1 ml-3 mb-0"
                      onClick={() => deletion(order._id)}
                    >
                     <i class="fab fa-amazon-pay"></i>
                         now
                    </Button> */}
                  </td>
                  <td>
                    <Button
                      variant="outline-danger"
                      className="p-1 ml-3 mb-0"
                      onClick={() => deletion(order._id)}
                    >
                      <i className="fas mx-1 fa-trash"></i>
                      Delete
                    </Button>
                  </td>
                </tr>
              </tbody>
            );
          })}
        </Table>
      )}
    </div>
  );
};

export default Orders;
