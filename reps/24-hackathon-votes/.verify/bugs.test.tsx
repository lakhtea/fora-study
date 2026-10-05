import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import App from "../App";
import { resetServer } from "../api/server";

beforeEach(() => resetServer());
async function loadPage() {
  render(<App />);
  await waitFor(() => expect(within(screen.getByLabelText("Projects")).getAllByRole("listitem")).toHaveLength(2), { timeout: 3000 });
}
const polls = () => Number(screen.getByLabelText("Polls").textContent!.match(/(\d+)/)![1]);

describe("rep 24: page works outside the planted bugs", () => {
  it("loads the default category and refreshes counts regularly", async () => {
    await loadPage();
    expect(screen.getByLabelText("Category heading")).toHaveTextContent("Internal");
    expect(screen.getByLabelText("Votes 10")).toHaveTextContent("10 votes");
    const before = polls();
    await new Promise((r) => setTimeout(r, 3200));
    expect(polls()).toBeGreaterThanOrEqual(before + 2);
  });
});

describe("rep 24: the three planted bugs reproduce", () => {
  it("HCK-410: polling speeds up every time you switch category", async () => {
    await loadPage();
    fireEvent.click(screen.getByRole("button", { name: "Client experience" }));
    await new Promise((r) => setTimeout(r, 500));
    fireEvent.click(screen.getByRole("button", { name: "Advisor tools" }));
    await new Promise((r) => setTimeout(r, 800));
    const start = polls();
    await new Promise((r) => setTimeout(r, 3200));
    expect(polls() - start).toBeGreaterThanOrEqual(5);
  });
  it("HCK-414: there is no way to vote", async () => {
    await loadPage();
    expect(screen.queryAllByRole("button", { name: /^Vote / })).toHaveLength(0);
    expect(screen.queryByText("Your vote")).not.toBeInTheDocument();
  });
  it("HCK-419: switching Advisor tools then Client experience quickly shows the wrong projects", async () => {
    await loadPage();
    fireEvent.click(screen.getByRole("button", { name: "Advisor tools" }));
    fireEvent.click(screen.getByRole("button", { name: "Client experience" }));
    await new Promise((r) => setTimeout(r, 950));
    expect(screen.getByLabelText("Category heading")).toHaveTextContent("Client experience");
    expect(screen.getByLabelText("Projects")).toHaveTextContent("Via voice notes");
  });
});
