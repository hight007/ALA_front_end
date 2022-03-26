import React from "react";
import { shallow } from "enzyme";
import Appointment from "./appointment";

describe("Appointment", () => {
  test("matches snapshot", () => {
    const wrapper = shallow(<Appointment />);
    expect(wrapper).toMatchSnapshot();
  });
});
