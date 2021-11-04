import React from "react";
import { shallow } from "enzyme";
import SalesAnalysis from "./salesAnalysis";

describe("SalesAnalysis", () => {
  test("matches snapshot", () => {
    const wrapper = shallow(<SalesAnalysis />);
    expect(wrapper).toMatchSnapshot();
  });
});
