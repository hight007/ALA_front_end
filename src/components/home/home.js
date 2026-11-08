import moment from "moment";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Chart from "react-apexcharts";
import { OK, server } from "../../constants";
import { httpClient } from "../../utils/HttpClient";
import CurrencyFormat from "react-currency-format";
import { Icon } from "@iconify/react";

export default function Home() {
  const [generalData, setgeneralData] = useState(null);
  const [dataLabels, setdataLabels] = useState(true);
  const [chartType, setchartType] = useState("area");

  useEffect(() => {
    getGeneralData();
  }, []);

  const getGeneralData = async () => {
    const response = await httpClient.get(server.REPORT_GENERAL_URL);
    if (response.data.api_result === OK) {
      setgeneralData(response.data);
    }
  };

  const renderHeroBanner = () => {
    const latestDate =
      generalData && generalData.dailySales?.length > 0
        ? moment(
            generalData.dailySales[generalData.dailySales.length - 1].createdAt
          ).format("DD MMM YYYY")
        : moment().format("DD MMM YYYY");

    return (
      <div className="ala-hero-banner">
        <div className="d-flex align-items-center" style={{ gap: "1.25rem" }}>
          <img
            src="/img/ALA_logo.png"
            alt="ALA Clinic"
            style={{
              height: "68px",
              borderRadius: "12px",
              background: "rgba(255,255,255,0.06)",
              padding: "6px 12px",
            }}
          />
          <div>
            <h2 className="ala-hero-title">ALA Aesthetic Clinic Dashboard</h2>
            <p className="ala-hero-subtitle">
              สรุปภาพรวมการให้บริการคลินิก • ข้อมูลอัปเดตล่าสุด:{" "}
              <strong style={{ color: "#FFF" }}>{latestDate}</strong>
            </p>
          </div>
        </div>
        <div className="ala-quick-actions">
          <Link to="/patient/patient_data" className="btn btn-primary">
            <i className="fas fa-user-plus" /> ทะเบียนคนไข้ (OPD)
          </Link>
          <Link to="/patient/patient_status" className="btn btn-info">
            <i className="fas fa-columns" /> กระดานคิวคนไข้
          </Link>
          <Link to="/report/daily_sales_report" className="btn btn-default">
            <i className="fas fa-file-invoice-dollar" /> รายงานยอดขาย
          </Link>
        </div>
      </div>
    );
  };

  const renderGeneralData = () => {
    if (!generalData) return null;
    const latest =
      generalData.dailySales.length > 0
        ? generalData.dailySales[generalData.dailySales.length - 1]
        : { customer: 0, new_customer: 0, sales: 0 };

    return (
      <div className="row mb-2">
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="info-box">
            <span
              className="info-box-icon"
              style={{
                background: "linear-gradient(135deg, #1E2430 0%, #334155 100%)",
                color: "#E9C070",
              }}
            >
              <i className="fas fa-users" />
            </span>
            <div className="info-box-content">
              <span className="info-box-text">ลูกค้าทั้งหมดในระบบ</span>
              <span className="info-box-number">
                <CurrencyFormat
                  value={generalData.totalPatient || 0}
                  displayType={"text"}
                  thousandSeparator={true}
                  suffix={" ท่าน"}
                />
              </span>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="info-box">
            <span
              className="info-box-icon"
              style={{
                background: "linear-gradient(135deg, #E9C070 0%, #C5953A 100%)",
                color: "#1E2430",
              }}
            >
              <Icon icon="fa-solid:user-tie" />
            </span>
            <div className="info-box-content">
              <Link
                to="/report/daily_sales_report"
                className="info-box-text"
                style={{ color: "#C5953A", fontWeight: 600 }}
              >
                ลูกค้าเข้าใช้บริการวันนี้ <i className="fas fa-external-link-alt ml-1" style={{ fontSize: "0.7rem" }} />
              </Link>
              <span className="info-box-number">{latest.customer} ท่าน</span>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="info-box">
            <span
              className="info-box-icon"
              style={{
                background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                color: "#FFFFFF",
              }}
            >
              <Icon icon="fa-solid:user-plus" />
            </span>
            <div className="info-box-content">
              <Link
                to="/report/daily_new_customer"
                className="info-box-text"
                style={{ color: "#059669", fontWeight: 600 }}
              >
                ลูกค้าใหม่วันนี้ <i className="fas fa-external-link-alt ml-1" style={{ fontSize: "0.7rem" }} />
              </Link>
              <span className="info-box-number">{latest.new_customer} ท่าน</span>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="info-box">
            <span
              className="info-box-icon"
              style={{
                background: "linear-gradient(135deg, #55C5D9 0%, #36A2B7 100%)",
                color: "#FFFFFF",
              }}
            >
              <Icon icon="bi:cash-coin" />
            </span>
            <div className="info-box-content">
              <span className="info-box-text">ยอดขายวันนี้</span>
              <span className="info-box-number" style={{ color: "#0F766E" }}>
                <CurrencyFormat
                  value={latest.sales || 0}
                  displayType={"text"}
                  thousandSeparator={true}
                  suffix={" ฿"}
                  renderText={(value) => <b>{value}</b>}
                />
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderSalesChart = () => {
    if (!generalData || generalData.dailySales.length === 0) return null;

    return (
      <div className="card">
        <div className="card-header d-flex align-items-center justify-content-between flex-wrap">
          <h3 className="card-title">
            <i className="fas fa-chart-area" style={{ color: "#C5953A" }} />
            แนวโน้มยอดขายรายวัน (Daily Sales Trend)
          </h3>
          <div className="d-flex align-items-center" style={{ gap: "0.65rem" }}>
            <button
              className="btn btn-default btn-sm"
              onClick={() => setdataLabels(!dataLabels)}
            >
              <i className={`fas ${dataLabels ? "fa-eye-slash" : "fa-eye"}`} />
              {dataLabels ? "ซ่อนตัวเลขบนกราฟ" : "แสดงตัวเลขบนกราฟ"}
            </button>
            <div className="ala-segmented-group">
              <button
                className={`ala-segmented-btn ${
                  chartType === "area" ? "active" : ""
                }`}
                onClick={() => setchartType("area")}
              >
                Area
              </button>
              <button
                className={`ala-segmented-btn ${
                  chartType === "line" ? "active" : ""
                }`}
                onClick={() => setchartType("line")}
              >
                Line
              </button>
              <button
                className={`ala-segmented-btn ${
                  chartType === "bar" ? "active" : ""
                }`}
                onClick={() => setchartType("bar")}
              >
                Bar
              </button>
            </div>
          </div>
        </div>
        <div className="card-body">
          <div className="mixed-chart" style={{ width: "100%" }}>
            <Chart
              options={{
                chart: {
                  fontFamily: "Prompt, sans-serif",
                  toolbar: { show: true },
                },
                colors: ["#D4A24C", "#55C5D9"],
                fill: {
                  type: chartType === "area" ? "gradient" : "solid",
                  gradient: {
                    shadeIntensity: 1,
                    opacityFrom: 0.45,
                    opacityTo: 0.05,
                    stops: [0, 95, 100],
                  },
                },
                xaxis: {
                  categories: generalData.salesChartData.categories,
                  labels: {
                    rotate: -45,
                    rotateAlways: true,
                    style: {
                      fontSize: '11px',
                      fontWeight: 500,
                      colors: '#64748B',
                    },
                    formatter: (val) => {
                      if (!val) return '';
                      return moment(val).format('DD MMM YY');
                    },
                  },
                  tickPlacement: 'on',
                },
                stroke: {
                  curve: "smooth",
                  width: 3,
                },
                dataLabels: {
                  enabled: dataLabels,
                },
                grid: {
                  borderColor: "#F1EDE4",
                },
              }}
              series={generalData.salesChartData.series}
              type={chartType}
              height={380}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="content-wrapper">
      <section className="content pt-3">
        <div className="container-fluid">
          {renderHeroBanner()}
          {renderGeneralData()}
          {renderSalesChart()}
        </div>
      </section>
    </div>
  );
}
