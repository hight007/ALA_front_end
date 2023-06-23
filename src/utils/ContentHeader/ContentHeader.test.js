import React from "react";
import { shallow } from "enzyme";
import ContentHeader from "./ContentHeader";

describe("ContentHeader", () => {
  test("matches snapshot", () => {
    const wrapper = shallow(<ContentHeader />);
    expect(wrapper).toMatchSnapshot();
  });
});
