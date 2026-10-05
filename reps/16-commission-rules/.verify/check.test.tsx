import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App";

async function loadPage() {
  render(<App />);
  await screen.findByText(/Q3 sample: 2,000 bookings/, {}, { timeout: 4000 });
}
const previewRenders = () => Number(screen.getByTestId("preview").getAttribute("data-renders"));

describe("rep 16: your fixes", () => {
  it("CMR-901 fixed: typing doesn't touch the preview; committing the rate does, once", async () => {
    const user = userEvent.setup();
    await loadPage();
    const before = previewRenders();
    await user.clear(screen.getByLabelText("Rate standard"));
    await user.type(screen.getByLabelText("Rate standard"), "15");
    expect(previewRenders()).toBe(before);
    await user.tab();
    await waitFor(() => expect(screen.getByLabelText("Commission 3")).toHaveTextContent("$559"));
    expect(previewRenders()).toBe(before + 1);
  });
  it("CMR-904 fixed: bookings without a rule say so and are counted", async () => {
    await loadPage();
    expect(screen.getByLabelText("Commission 1")).toHaveTextContent(/No rule/);
    expect(screen.getByText(/446 bookings have no matching rule/)).toBeInTheDocument();
  });
  it("CMR-908 fixed: the totals follow the sample quarter", async () => {
    const user = userEvent.setup();
    await loadPage();
    await user.selectOptions(screen.getByLabelText("Sample quarter"), "Q4");
    await screen.findByText(/Q4 sample: 2,000 bookings/, {}, { timeout: 4000 });
    await waitFor(() => expect(screen.getByLabelText("Preview total")).toHaveTextContent("$636,434 commission on $7,534,482"));
  });
  it("the rest of the page still works", async () => {
    const user = userEvent.setup();
    await loadPage();
    await user.click(screen.getByLabelText("Enabled standard"));
    await waitFor(() => expect(screen.getByLabelText("Commission 3")).toHaveTextContent("$0"));
  });
});
