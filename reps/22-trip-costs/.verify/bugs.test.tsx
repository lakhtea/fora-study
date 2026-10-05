import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App";

async function loadPage() {
  render(<App />);
  await screen.findByLabelText("Cost lines", {}, { timeout: 3000 });
}

describe("rep 22: page works outside the planted bugs", () => {
  it("converts lines at the client rate and toggles fees", async () => {
    const user = userEvent.setup();
    await loadPage();
    expect(screen.getByLabelText("USD 1")).toHaveTextContent("$4,318.27");
    expect(screen.getByLabelText("USD 2")).toHaveTextContent("$104.65");
    await user.click(screen.getByLabelText("Include fees"));
    expect(screen.queryByLabelText("EUR 5")).not.toBeInTheDocument();
    await waitFor(() => expect(screen.getByLabelText("Client total")).toHaveTextContent("$4,681.80"));
  });
});

describe("rep 22: the three planted bugs reproduce", () => {
  it("TRC-150: changing the rate doesn't change the USD column until fees are toggled", async () => {
    const user = userEvent.setup();
    await loadPage();
    fireEvent.change(screen.getByLabelText("Rate"), { target: { value: "1.2" } });
    expect(screen.getByLabelText("Client rate")).toHaveTextContent("1.22");
    expect(screen.getByLabelText("USD 1")).toHaveTextContent("$4,318.27");
    await user.click(screen.getByLabelText("Include fees"));
    await waitFor(() => expect(screen.getByLabelText("USD 1")).toHaveTextContent("$4,798.08"));
  });
  it("TRC-154: the client rate reads 1.08000.02 until the rate box is touched", async () => {
    await loadPage();
    expect(screen.getByLabelText("Client rate")).toHaveTextContent("1.08000.02");
    fireEvent.change(screen.getByLabelText("Rate"), { target: { value: "1.08" } });
    expect(screen.getByLabelText("Client rate")).toHaveTextContent("1.1");
  });
  it("TRC-159: the booking fee is a hundred times too big", async () => {
    await loadPage();
    expect(screen.getByLabelText("EUR 5")).toHaveTextContent("€12,500.00");
    expect(screen.getByLabelText("Client total")).toHaveTextContent("$18,451.80");
  });
});
