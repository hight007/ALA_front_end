import React from "react";
import { shallow } from "enzyme";
import DailySalesReport from "./dailySalesReport";

describe("DailySalesReport", () => {
  test("matches snapshot", () => {
    const wrapper = shallow(<DailySalesReport />);
    expect(wrapper).toMatchSnapshot();
  });
});
