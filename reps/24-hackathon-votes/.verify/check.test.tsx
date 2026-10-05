import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App";
import { resetServer } from "../api/server";

beforeEach(() => resetServer());
async function loadPage() {
  render(<App />);
  await waitFor(() => expect(within(screen.getByLabelText("Projects")).getAllByRole("listitem")).toHaveLength(2), { timeout: 3000 });
}
const polls = () => Number(screen.getByLabelText("Polls").textContent!.match(/(\d+)/)![1]);

describe("rep 24: your fixes", () => {
  it("HCK-410 fixed: one poll per tick no matter how many times you switch", async () => {
    await loadPage();
    fireEvent.click(screen.getByRole("button", { name: "Client experience" }));
    await new Promise((r) => setTimeout(r, 500));
    fireEvent.click(screen.getByRole("button", { name: "Advisor tools" }));
    await new Promise((r) => setTimeout(r, 800));
    const start = polls();
    await new Promise((r) => setTimeout(r, 3200));
    expect(polls() - start).toBeLessThanOrEqual(3);
  });
  it("HCK-414 fixed: open projects can be voted for and the vote moves", async () => {
    const user = userEvent.setup();
    await loadPage();
    await user.click(screen.getByRole("button", { name: "Vote Flaky test tracker" }));
    await waitFor(() => expect(within(screen.getByTestId("project-10")).getByText("Your vote")).toBeInTheDocument(), { timeout: 3000 });
    expect(screen.getByLabelText("Votes 10")).toHaveTextContent("11 votes");
    await user.click(screen.getByRole("button", { name: "Vote Deploy preview bot" }));
    await waitFor(() => expect(within(screen.getByTestId("project-11")).getByText("Your vote")).toBeInTheDocument(), { timeout: 3000 });
    expect(screen.getByLabelText("Votes 10")).toHaveTextContent("10 votes");
  });
  it("HCK-419 fixed: the list always matches the heading", async () => {
    await loadPage();
    fireEvent.click(screen.getByRole("button", { name: "Advisor tools" }));
    fireEvent.click(screen.getByRole("button", { name: "Client experience" }));
    await new Promise((r) => setTimeout(r, 950));
    expect(screen.getByLabelText("Category heading")).toHaveTextContent("Client experience");
    expect(within(screen.getByLabelText("Projects")).getAllByRole("listitem")).toHaveLength(3);
    expect(screen.getByLabelText("Projects")).not.toHaveTextContent("Via voice notes");
  });
  it("the rest of the page still works", async () => {
    await loadPage();
    expect(screen.getByLabelText("Votes 10")).toHaveTextContent("10 votes");
  });
});
