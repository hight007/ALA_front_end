import React from "react";
import { shallow } from "enzyme";
import Patient_historicalData from "./patient_historicalData";

describe("Patient_historicalData", () => {
  test("matches snapshot", () => {
    const wrapper = shallow(<Patient_historicalData />);
    expect(wrapper).toMatchSnapshot();
  });
});
