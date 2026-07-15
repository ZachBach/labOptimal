import React from "react";
import { render, screen } from "@testing-library/react-native";

import { StatusPill } from "../StatusPill";

describe("StatusPill", () => {
    it("shows default label for low", async () => {
        await render(<StatusPill variant="low" />);
        expect(screen.getByText("Low")).toBeTruthy();
    });

    it("shows default label for in-range", async () => {
        await render(<StatusPill variant="in_range" />);
        expect(screen.getByText("In range")).toBeTruthy();
    });

    it("allows overriding the label", async () => {
        await render(<StatusPill variant="watch" label="Review" />);
        expect(screen.getByText("Review")).toBeTruthy();
    });
});
