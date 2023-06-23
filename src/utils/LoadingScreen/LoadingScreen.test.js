import React from "react";
import { shallow } from "enzyme";
import LoadingScreen from "./LoadingScreen";

describe("LoadingScreen", () => {
  test("matches snapshot", () => {
    const wrapper = shallow(<LoadingScreen />);
    expect(wrapper).toMatchSnapshot();
  });
});
