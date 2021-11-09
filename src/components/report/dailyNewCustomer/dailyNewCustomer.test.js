import React from "react";
import { shallow } from "enzyme";
import DailyNewCustomer from "./dailyNewCustomer";

describe("DailyNewCustomer", () => {
  test("matches snapshot", () => {
    const wrapper = shallow(<DailyNewCustomer />);
    expect(wrapper).toMatchSnapshot();
  });
});
