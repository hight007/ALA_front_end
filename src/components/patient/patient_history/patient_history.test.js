import React from "react";
import { shallow } from "enzyme";
import Patient_history from "./patient_history";

describe("Patient_history", () => {
  test("matches snapshot", () => {
    const wrapper = shallow(<Patient_history />);
    expect(wrapper).toMatchSnapshot();
  });
});
