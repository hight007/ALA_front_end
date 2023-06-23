import React from "react";
import { shallow } from "enzyme";
import StockIssues from "./StockIssues";

describe("StockIssues", () => {
  test("matches snapshot", () => {
    const wrapper = shallow(<StockIssues />);
    expect(wrapper).toMatchSnapshot();
  });
});
