import React from "react";
import Layout from "../Pages/Layout";
import { Link } from "react-router-dom";
import { FaBrain } from "react-icons/fa";

const Recommendations = () => {
  return (
    <>
      <div className="container-fluid">
        <div className="row">
          <div className="col-md-1 p-0">
            <Layout />
          </div>
          <div className="col-md-11 p-0">
            <div className="dashboard">
              <div className="mb-3 p-3 flex-column text-center fs-5 pt-5">
                <h2 className="bold">Get AI-Powered Recommendations</h2>
                <div>
                  <p>
                    Leverage AI to optimize your email campaigns effortlessly.
                    <br /> Receive smart suggestions for subject lines, content,
                    and design to maximize engagement.
                  </p>
                </div>
              </div>
              <div
                className="d-flex flex-column border gap-3 p-4 me-4 mx-auto text-center"
                style={{
                  borderRadius: "12px",
                  boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
                  background: "#fff",
                  flex:"1 1 0%",
                }}
              >
                <div>
                  <FaBrain style={{ fontSize: "32px", color: "#333" }} />
                </div>
                <h4 className="fw-bold">AI Recommendations</h4>
                <p className="fs-5 fw-semibold">
                  Get AI-powered suggestions to enhance your template
                </p>
                <div className="d-flex gap-3 align-items-center justify-content-center">
                  <button
                    type="submit"
                    style={{
                      padding: "0.6rem 1.2rem",
                      background: "#f8f9fa",
                      border: "1px solid #ccc",
                      borderRadius: "8px",
                      boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.1)",
                      cursor: "pointer",
                      transition: "0.3s",
                    }}
                    onMouseOver={(e) => (e.target.style.background = "#e9ecef")}
                    onMouseOut={(e) => (e.target.style.background = "#f8f9fa")}
                  >
                    Subject Recommendations
                  </button>
                  <button
                    type="submit"
                    style={{
                      padding: "0.6rem 1.2rem",
                      background: "#f8f9fa",
                      border: "1px solid #ccc",
                      borderRadius: "8px",
                      boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.1)",
                      cursor: "pointer",
                      transition: "0.3s",
                    }}
                    onMouseOver={(e) => (e.target.style.background = "#e9ecef")}
                    onMouseOut={(e) => (e.target.style.background = "#f8f9fa")}
                  >
                    Content Recommendations
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Recommendations;
