import React from "react";
import { fireEvent, render, screen } from "@testing-library/react-native";

import { PrimaryButton, SecondaryButton } from "../Button";

describe("Button components", () => {
    it("renders a primary button and handles press", async () => {
        const onPress = jest.fn();
        await render(<PrimaryButton label="Scan now" onPress={onPress} />);

        await fireEvent.press(screen.getByText("Scan now"));

        expect(onPress).toHaveBeenCalledTimes(1);
    });

    it("renders a secondary button label", async () => {
        await render(<SecondaryButton label="Maybe later" />);

        expect(screen.getByText("Maybe later")).toBeTruthy();
    });
});
