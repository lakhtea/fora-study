import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App";

async function parsed() {
  const user = userEvent.setup();
  render(<App />);
  await new Promise((r) => setTimeout(r, 400));
  await user.click(screen.getByRole("button", { name: "Parse" }));
  await screen.findByLabelText("Preview");
  return user;
}

describe("rep 17: page works outside the planted bugs", () => {
  it("parses five rows and imports them", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const user = await parsed();
    expect(screen.getByLabelText("Preview").querySelectorAll("tbody tr")).toHaveLength(5);
    expect(screen.getByTestId("row-0")).toHaveTextContent("Priya Natarajan");
    await user.click(screen.getByRole("button", { name: /^Import/ }));
    expect(await screen.findByRole("status", {}, { timeout: 3000 })).toHaveTextContent(/Imported \d clients/);
    spy.mockRestore();
  });
});

describe("rep 17: the three planted bugs reproduce", () => {
  it("IMP-130: every parsed row is a prospect, whatever the CSV said", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    await parsed();
    expect(screen.getByLabelText("Status row 0")).toHaveValue("prospect");
    expect(screen.getByLabelText("Status row 4")).toHaveValue("prospect");
    spy.mockRestore();
  });
  it("IMP-134: Maya is an existing client and isn't flagged; the header never finishes loading", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    await parsed();
    expect(screen.getByLabelText("Existing count")).toHaveTextContent("Loading your clients");
    expect(screen.getByLabelText("Check row 1")).toHaveTextContent("new");
    expect(screen.getByRole("button", { name: "Import 5 new" })).toBeInTheDocument();
    spy.mockRestore();
  });
  it("IMP-139: changing one Sam's status changes the other Sam too", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const user = await parsed();
    await user.selectOptions(screen.getByLabelText("Status row 2"), "active");
    expect(screen.getByLabelText("Status row 2")).toHaveValue("active");
    expect(screen.getByLabelText("Status row 3")).toHaveValue("active");
    expect(spy.mock.calls.some((call) => String(call[0]).includes("same key"))).toBe(true);
    spy.mockRestore();
  });
});
