import React from "react";
import { fireEvent, render } from "@testing-library/react-native";

import { PrimaryButton, SecondaryButton } from "../Button";

describe("Button components", () => {
    it("renders a primary button and handles press", () => {
        const onPress = jest.fn();
        const { getByText } = render(<PrimaryButton label="Scan now" onPress={onPress} />);

        fireEvent.press(getByText("Scan now"));

        expect(onPress).toHaveBeenCalledTimes(1);
    });

    it("renders a secondary button label", () => {
        const { getByText } = render(<SecondaryButton label="Maybe later" />);

        expect(getByText("Maybe later")).toBeTruthy();
    });
});
