import React from "react";
import { shallow } from "enzyme";
import Patient_payment from "./patient_payment";

describe("Patient_payment", () => {
  test("matches snapshot", () => {
    const wrapper = shallow(<Patient_payment />);
    expect(wrapper).toMatchSnapshot();
  });
});
