import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App";

async function loadPage() {
  render(<App />);
  await screen.findByText("5 payout periods, paid monthly", {}, { timeout: 3000 });
}

describe("rep 08: your fixes", () => {
  it("PAY-120 fixed: the estimate follows the threshold immediately", async () => {
    await loadPage();
    fireEvent.change(screen.getByLabelText("Threshold"), { target: { value: "2000" } });
    expect(screen.getByLabelText("Estimate")).toHaveTextContent("Not yet: $1,650 of $2,000");
    fireEvent.change(screen.getByLabelText("Threshold"), { target: { value: "1000" } });
    expect(screen.getByLabelText("Estimate")).toHaveTextContent("$1,650 ready");
  });
  it("PAY-124 fixed: the selected payout is recognized and marked", async () => {
    const user = userEvent.setup();
    await loadPage();
    await user.selectOptions(screen.getByLabelText("Payout to review"), "7003");
    expect(screen.getByLabelText("Selected payout")).toHaveTextContent("Selected: September 2026");
    await user.click(screen.getByRole("button", { name: "Mark as reviewed" }));
    expect(screen.getByLabelText("Reviewed 2026-09")).toHaveTextContent("Yes");
    expect(screen.getByLabelText("Reviewed 2026-10")).toHaveTextContent("No");
  });
  it("PAY-127 fixed: Reset clears the box and the summary agrees", async () => {
    const user = userEvent.setup();
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    await loadPage();
    fireEvent.change(screen.getByLabelText("Threshold"), { target: { value: "750" } });
    await user.click(screen.getByRole("button", { name: "Reset to default" }));
    expect(screen.getByLabelText("Threshold summary")).toHaveTextContent("Default ($500)");
    expect(screen.getByLabelText("Threshold")).toHaveValue(null);
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });
  it("the rest of the page still works", async () => {
    await loadPage();
    expect(screen.getByLabelText("Estimate")).toHaveTextContent("$1,650 ready");
  });
});
