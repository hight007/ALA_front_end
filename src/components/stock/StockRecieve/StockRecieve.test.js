import React from "react";
import { shallow } from "enzyme";
import StockRecieve from "./StockRecieve";

describe("StockRecieve", () => {
  test("matches snapshot", () => {
    const wrapper = shallow(<StockRecieve />);
    expect(wrapper).toMatchSnapshot();
  });
});
