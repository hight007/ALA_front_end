import React from "react";
import { shallow } from "enzyme";
import Patient_status from "./patient_status";

describe("Patient_status", () => {
  test("matches snapshot", () => {
    const wrapper = shallow(<Patient_status />);
    expect(wrapper).toMatchSnapshot();
  });
});
