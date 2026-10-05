import { execSync, spawn } from "node:child_process";
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const [cmd, arg] = process.argv.slice(2);
const root = process.cwd();

function usage() {
  console.log(`Usage:
  npm run rep <n>        start the dev server on debugging rep <n>
  npm run verify <n>     prove the planted bugs reproduce on the pristine rep (PASS before you touch it)
  npm run check <n>      run the acceptance tests for your fixes (PASS means all three are fixed correctly)
  npm run solution <n>   apply the key's fixes to a scratch copy and run the acceptance tests against it
  npm run reset <n>      restore a rep to its pristine state with git
  npm run app <n>        start the dev server on build app <n>
  npm run accept <n>     run the acceptance tests for build app <n>
  npm run coding <n>     run the tests for coding problem <n>
  npm run typecheck      type-check everything (the pristine reps all pass)`);
  process.exit(1);
}

function findDir(base, n) {
  if (!n) usage();
  const prefix = String(n).padStart(2, "0") + "-";
  const hit = readdirSync(join(root, base)).find((d) => d.startsWith(prefix));
  if (!hit) {
    console.error(`No folder in ${base}/ starts with ${prefix}`);
    process.exit(1);
  }
  return `${base}/${hit}`;
}

function writeCurrent(relDir) {
  writeFileSync(join(root, "src/current.tsx"), `export { default } from "../${relDir}/App";\n`);
}

function run(bin, args) {
  const child = spawn(bin, args, { stdio: "inherit", shell: process.platform === "win32" });
  child.on("exit", (code) => process.exit(code ?? 0));
}

switch (cmd) {
  case "rep": {
    const dir = findDir("reps", arg);
    writeCurrent(dir);
    console.log(`Loaded ${dir}. Open BUGS.md in a second window and start a 30-minute timer.`);
    run("npx", ["vite"]);
    break;
  }
  case "app": {
    const dir = findDir("apps", arg);
    writeCurrent(dir);
    console.log(`Loaded ${dir}. Open SPEC.md and start a 60-minute timer.`);
    run("npx", ["vite"]);
    break;
  }
  case "verify": {
    const dir = findDir("reps", arg);
    run("npx", ["vitest", "run", `${dir}/.verify/bugs.test.tsx`]);
    break;
  }
  case "check": {
    const dir = findDir("reps", arg);
    run("npx", ["vitest", "run", `${dir}/.verify/check.test.tsx`]);
    break;
  }
  case "solution": {
    const dir = findDir("reps", arg);
    const name = dir.split("/")[1];
    const tmp = join(root, ".tmp", name);
    rmSync(tmp, { recursive: true, force: true });
    mkdirSync(tmp, { recursive: true });
    cpSync(join(root, dir), tmp, { recursive: true });
    const overlay = join(tmp, ".verify", "solution");
    if (existsSync(overlay)) cpSync(overlay, tmp, { recursive: true });
    console.log(`Applied the key's fixes to .tmp/${name} and running the acceptance tests there.`);
    run("npx", ["vitest", "run", `.tmp/${name}/.verify/check.test.tsx`]);
    break;
  }
  case "reset": {
    const dir = findDir("reps", arg);
    execSync(`git checkout -- ${dir}`, { stdio: "inherit" });
    console.log(`Restored ${dir} to its pristine state.`);
    break;
  }
  case "accept": {
    const dir = findDir("apps", arg);
    run("npx", ["vitest", "run", `${dir}/acceptance.test.tsx`]);
    break;
  }
  case "coding": {
    const dir = findDir("coding", arg);
    run("npx", ["vitest", "run", dir]);
    break;
  }
  default:
    usage();
}
