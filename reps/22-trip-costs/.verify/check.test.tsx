import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App";

async function loadPage() {
  render(<App />);
  await screen.findByLabelText("Cost lines", {}, { timeout: 3000 });
}

describe("rep 22: your fixes", () => {
  it("TRC-150 fixed: the USD column follows the rate immediately", async () => {
    await loadPage();
    fireEvent.change(screen.getByLabelText("Rate"), { target: { value: "1.2" } });
    expect(screen.getByLabelText("USD 1")).toHaveTextContent("$4,798.08");
    expect(screen.getByLabelText("Client total")).toHaveTextContent("$5,355.00");
  });
  it("TRC-154 fixed: the client rate is a number from the start", async () => {
    await loadPage();
    expect(screen.getByLabelText("Client rate")).toHaveTextContent("1.1000");
    expect(screen.getByLabelText("Client rate")).not.toHaveTextContent("1.08000.02");
  });
  it("TRC-159 fixed: the booking fee is €125", async () => {
    await loadPage();
    expect(screen.getByLabelText("EUR 5")).toHaveTextContent("€125.00");
    expect(screen.getByLabelText("USD 5")).toHaveTextContent("$137.70");
    expect(screen.getByLabelText("Client total")).toHaveTextContent("$4,819.50");
  });
  it("the rest of the page still works", async () => {
    const user = userEvent.setup();
    await loadPage();
    await user.click(screen.getByLabelText("Include fees"));
    expect(screen.getByLabelText("Client total")).toHaveTextContent("$4,681.80");
  });
});
