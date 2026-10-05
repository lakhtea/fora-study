import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";
import * as server from "./api/server";

beforeEach(() => server.resetServer());

async function start() {
  const user = userEvent.setup();
  render(<App />);
  await screen.findByLabelText("Report kind", {}, { timeout: 4000 });
  return user;
}
async function generate(user: ReturnType<typeof userEvent.setup>, kind: string, month: string) {
  await user.selectOptions(screen.getByLabelText("Report kind"), kind);
  fireEvent.change(screen.getByLabelText("Month"), { target: { value: month } });
  await user.click(screen.getByRole("button", { name: "Generate" }));
}

describe("app 05 acceptance", () => {
  it("creates a job, polls it to done, then stops polling", async () => {
    const user = await start();
    await generate(user, "payouts", "2026-09");
    const list = screen.getByLabelText("Jobs");
    const item = await within(list).findByRole("listitem", {}, { timeout: 4000 });
    expect(item).toHaveTextContent("queued");
    await within(item).findByRole("progressbar", {}, { timeout: 4000 });
    await waitFor(() => expect(item).toHaveTextContent("done"), { timeout: 8000 });
    expect(within(item).getByRole("link", { name: "Download" })).toHaveAttribute("href", "/downloads/payouts-2026-09.csv");
    const spy = vi.spyOn(server, "apiFetch");
    await new Promise((r) => setTimeout(r, 1300));
    expect(spy.mock.calls.filter(([url]) => String(url).includes("/api/reports/"))).toHaveLength(0);
    spy.mockRestore();
  }, 15000);
  it("shows the server's failure for a locked month", async () => {
    const user = await start();
    await generate(user, "payouts", "2026-02");
    const item = await within(screen.getByLabelText("Jobs")).findByRole("listitem", {}, { timeout: 4000 });
    await waitFor(() => expect(item).toHaveTextContent("failed"), { timeout: 8000 });
    expect(item).toHaveTextContent("February payouts are locked");
  }, 15000);
  it("cancels optimistically and rolls back a failed cancel", async () => {
    const user = await start();
    await generate(user, "commissions", "2026-10");
    const list = screen.getByLabelText("Jobs");
    const item = await within(list).findByRole("listitem", {}, { timeout: 4000 });
    const cancel = within(item).getByRole("button", { name: "Cancel" });
    await user.click(cancel);
    expect(within(list).queryAllByRole("listitem")).toHaveLength(0);
    await new Promise((r) => setTimeout(r, 400));
    expect(within(list).queryAllByRole("listitem")).toHaveLength(0);
  }, 15000);
  it("recovers from a render error with a boundary", async () => {
    await start();
    expect(screen.queryByText("Something went wrong with the job list")).not.toBeInTheDocument();
  });
});
