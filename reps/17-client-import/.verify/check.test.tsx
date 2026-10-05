import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App";

async function parsed() {
  const user = userEvent.setup();
  render(<App />);
  await screen.findByText("Checking against 3 existing clients", {}, { timeout: 3000 });
  await user.click(screen.getByRole("button", { name: "Parse" }));
  await screen.findByLabelText("Preview");
  return user;
}

describe("rep 17: your fixes", () => {
  it("IMP-130 fixed: statuses come from the CSV, with the default only for empty cells", async () => {
    await parsed();
    expect(screen.getByLabelText("Status row 0")).toHaveValue("active");
    expect(screen.getByLabelText("Status row 2")).toHaveValue("prospect");
    expect(screen.getByLabelText("Status row 4")).toHaveValue("inactive");
  });
  it("IMP-134 fixed: existing clients are flagged and excluded from the import count", async () => {
    await parsed();
    expect(screen.getByLabelText("Check row 1")).toHaveTextContent("already a client");
    expect(screen.getByLabelText("Check row 0")).toHaveTextContent("new");
  });
  it("IMP-139 fixed: each row edits independently and the pasted duplicate is flagged", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const user = await parsed();
    await user.selectOptions(screen.getByLabelText("Status row 2"), "active");
    expect(screen.getByLabelText("Status row 2")).toHaveValue("active");
    expect(screen.getByLabelText("Status row 3")).toHaveValue("prospect");
    expect(screen.getByLabelText("Check row 3")).toHaveTextContent(/duplicate/i);
    expect(screen.getByRole("button", { name: "Import 3 new" })).toBeInTheDocument();
    expect(spy.mock.calls.some((call) => String(call[0]).includes("same key"))).toBe(false);
    spy.mockRestore();
  });
  it("the rest of the page still works", async () => {
    const user = await parsed();
    await user.click(screen.getByRole("button", { name: /^Import/ }));
    expect(await screen.findByRole("status", {}, { timeout: 3000 })).toHaveTextContent("Imported 3 clients.");
  });
});
