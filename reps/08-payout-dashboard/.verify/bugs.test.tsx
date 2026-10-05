import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App";

async function loadPage() {
  render(<App />);
  await screen.findByText("5 payout periods, paid monthly", {}, { timeout: 3000 });
}

describe("rep 08: page works outside the planted bugs", () => {
  it("lists payouts and estimates the next payout against the default threshold", async () => {
    await loadPage();
    expect(screen.getByLabelText("Payouts").querySelectorAll("tbody tr")).toHaveLength(5);
    expect(screen.getByLabelText("Estimate")).toHaveTextContent("$1,650 ready");
    expect(screen.getByLabelText("Threshold summary")).toHaveTextContent("Default ($500)");
    expect(screen.getByLabelText("Reviewed 2026-09")).toHaveTextContent("No");
  });
  it("refresh reloads rows", async () => {
    const user = userEvent.setup();
    await loadPage();
    await user.click(screen.getByRole("button", { name: "Refresh" }));
    await waitFor(() => expect(screen.getByRole("button", { name: "Refresh" })).toBeEnabled(), { timeout: 3000 });
  });
});

describe("rep 08: the three planted bugs reproduce", () => {
  it("PAY-120: raising the threshold doesn't change the estimate until Refresh", async () => {
    const user = userEvent.setup();
    await loadPage();
    fireEvent.change(screen.getByLabelText("Threshold"), { target: { value: "2000" } });
    expect(screen.getByLabelText("Threshold summary")).toHaveTextContent("Custom: $2,000");
    expect(screen.getByLabelText("Estimate")).toHaveTextContent("$1,650 ready");
    await user.click(screen.getByRole("button", { name: "Refresh" }));
    await waitFor(() => expect(screen.getByLabelText("Estimate")).toHaveTextContent("Not yet: $1,650 of $2,000"), { timeout: 3000 });
  });
  it("PAY-124: Mark as reviewed does nothing and the selected label says none", async () => {
    const user = userEvent.setup();
    await loadPage();
    await user.selectOptions(screen.getByLabelText("Payout to review"), "7003");
    expect(screen.getByLabelText("Selected payout")).toHaveTextContent("Selected: none");
    await user.click(screen.getByRole("button", { name: "Mark as reviewed" }));
    expect(screen.getByLabelText("Reviewed 2026-09")).toHaveTextContent("No");
  });
  it("PAY-127: Reset to default leaves the old number in the box", async () => {
    const user = userEvent.setup();
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    await loadPage();
    fireEvent.change(screen.getByLabelText("Threshold"), { target: { value: "750" } });
    expect(screen.getByLabelText("Threshold summary")).toHaveTextContent("Custom: $750");
    await user.click(screen.getByRole("button", { name: "Reset to default" }));
    expect(screen.getByLabelText("Threshold summary")).toHaveTextContent("Default ($500)");
    expect(screen.getByLabelText("Threshold")).toHaveValue(750);
    spy.mockRestore();
  });
});
