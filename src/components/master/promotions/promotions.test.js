import React from "react";
import { shallow } from "enzyme";
import Promotions from "./promotions";

describe("Promotions", () => {
  test("matches snapshot", () => {
    const wrapper = shallow(<Promotions />);
    expect(wrapper).toMatchSnapshot();
  });
});
