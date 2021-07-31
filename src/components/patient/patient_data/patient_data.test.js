import React from "react";
import { shallow } from "enzyme";
import Patient_data from "./patient_data";

describe("Patient_data", () => {
  test("matches snapshot", () => {
    const wrapper = shallow(<Patient_data />);
    expect(wrapper).toMatchSnapshot();
  });
});
