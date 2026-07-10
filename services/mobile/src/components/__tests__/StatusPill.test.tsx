import React from "react";
import { render } from "@testing-library/react-native";

import { StatusPill } from "../StatusPill";

describe("StatusPill", () => {
    it("shows default label for low", () => {
        const { getByText } = render(<StatusPill variant="low" />);
        expect(getByText("Low")).toBeTruthy();
    });

    it("shows default label for in-range", () => {
        const { getByText } = render(<StatusPill variant="in_range" />);
        expect(getByText("In range")).toBeTruthy();
    });

    it("allows overriding the label", () => {
        const { getByText } = render(<StatusPill variant="watch" label="Review" />);
        expect(getByText("Review")).toBeTruthy();
    });
});
