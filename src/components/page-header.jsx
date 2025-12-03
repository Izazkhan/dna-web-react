// components/PageHeader.jsx
import React from "react";
import { Link } from "react-router-dom";

const PageHeader = ({ title = "Page Title", breadcrumb = [] }) => {
  return (
    <div className="app-content-header">
      <div className="container-fluid">
        <div className="row">
          <div className="col-sm-6">
            <h3 className="mb-0">{title}</h3>
          </div>
          <div className="col-sm-6">
            <ol className="breadcrumb float-sm-end">
              {!!breadcrumb.length && (
                <li className="breadcrumb-item">
                  <Link to="/adcampaigns">Home</Link>
                </li>
              )}
              {breadcrumb.map((item, index) => (
                <li
                  key={index}
                  className={`breadcrumb-item ${item.active ? "active" : ""}`}
                  aria-current={item.active ? "page" : undefined}
                >
                  {item.link ? <a href={item.link}>{item.text}</a> : item.text}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageHeader;
