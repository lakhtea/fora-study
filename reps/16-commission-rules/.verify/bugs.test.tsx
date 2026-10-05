import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App";

async function loadPage() {
  render(<App />);
  await screen.findByText(/Q3 sample: 2,000 bookings/, {}, { timeout: 4000 });
}
const previewRenders = () => Number(screen.getByTestId("preview").getAttribute("data-renders"));

describe("rep 16: page works outside the planted bugs", () => {
  it("shows the preview, updates commission when a rate is committed, and toggles a rule", async () => {
    const user = userEvent.setup();
    await loadPage();
    expect(screen.getByLabelText("Preview total")).toHaveTextContent("$645,686 commission on $7,620,402");
    expect(screen.getByLabelText("Commission 2")).toHaveTextContent("$137");
    await user.clear(screen.getByLabelText("Rate preferred"));
    await user.type(screen.getByLabelText("Rate preferred"), "20");
    await user.tab();
    await waitFor(() => expect(screen.getByLabelText("Commission 2")).toHaveTextContent("$229"));
    await user.click(screen.getByLabelText("Enabled standard"));
    await waitFor(() => expect(screen.getByLabelText("Commission 3")).toHaveTextContent("$0"));
  });
});

describe("rep 16: the three planted bugs reproduce", () => {
  it("CMR-901: every keystroke in a rate box re-renders the heavy preview", async () => {
    const user = userEvent.setup();
    await loadPage();
    const before = previewRenders();
    await user.clear(screen.getByLabelText("Rate standard"));
    await user.type(screen.getByLabelText("Rate standard"), "15");
    expect(previewRenders()).toBe(before + 3);
  });
  it("CMR-904: boutique bookings show $0 commission with no warning", async () => {
    await loadPage();
    expect(screen.getByLabelText("Commission 1")).toHaveTextContent("$0");
    expect(screen.queryByText(/no matching rule/i)).not.toBeInTheDocument();
  });
  it("CMR-908: switching the sample quarter leaves the totals unchanged", async () => {
    const user = userEvent.setup();
    await loadPage();
    await user.selectOptions(screen.getByLabelText("Sample quarter"), "Q4");
    await screen.findByText(/Q4 sample: 2,000 bookings/, {}, { timeout: 4000 });
    expect(screen.getByLabelText("Preview total")).toHaveTextContent("$645,686 commission on $7,620,402");
  });
});
