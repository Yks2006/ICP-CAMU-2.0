import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const htmlDir = path.join(root, "..", "stitch-assets", "html");
const outDir = path.join(root, "src", "components", "pages");

const pages = [
  { slug: "dashboard", file: "dashboard.html", component: "DashboardPage" },
  { slug: "my-courses", file: "my-courses.html", component: "MyCoursesPage" },
  { slug: "settings", file: "settings.html", component: "SettingsPage" },
  { slug: "notifications", file: "notifications.html", component: "NotificationsPage" },
  { slug: "timetable", file: "timetable.html", component: "TimetablePage" },
  {
    slug: "attendance-dashboard",
    file: "attendance-dashboard.html",
    component: "AttendanceDashboardPage",
  },
  {
    slug: "assignment-dashboard",
    file: "assignment-dashboard.html",
    component: "AssignmentDashboardPage",
  },
];

function extractMainInner(html) {
  const mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
  if (!mainMatch) throw new Error("No <main> found");
  let inner = mainMatch[1].trim();
  inner = inner.replace(/<header[\s\S]*?<\/header>/gi, "");
  inner = inner.replace(/<style[\s\S]*?<\/style>/gi, "");
  inner = inner.replace(/^\s*<!--[\s\S]*?-->\s*/g, "");
  return inner.trim();
}

function htmlToJsx(html) {
  let jsx = html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/\sclass=/g, " className=")
    .replace(/\sfor=/g, " htmlFor=")
    .replace(/\stabindex=/g, " tabIndex=")
    .replace(/\sreadonly=/g, " readOnly=")
    .replace(/\sautocomplete=/g, " autoComplete=")
    .replace(/\smaxlength=/g, " maxLength=")
    .replace(/\sstroke-width=/g, " strokeWidth=")
    .replace(/\sstroke-dasharray=/g, " strokeDasharray=")
    .replace(/\sstroke-dashoffset=/g, " strokeDashoffset=")
    .replace(/\sfill-rule=/g, " fillRule=")
    .replace(/\sclip-rule=/g, " clipRule=")
    .replace(/\sviewbox=/gi, " viewBox=")
    .replace(/\sxmlns:xlink=/g, " xmlnsXlink=")
    .replace(/\sdata-icon=/g, " data-icon=")
    .replace(/\stype="text"/g, ' type="text"')
    .replace(/<img([^>]*?)(?<!\/)>/g, "<img$1 />")
    .replace(/<input([^>]*?)(?<!\/)>/g, "<input$1 />")
    .replace(/<br>/g, "<br />")
    .replace(/<hr>/g, "<hr />")
    .replace(/<meta([^>]*?)(?<!\/)>/g, "<meta$1 />")
    .replace(/<link([^>]*?)(?<!\/)>/g, "<link$1 />");

  jsx = jsx.replace(/\s(on\w+)=/gi, " data-$1=");
  jsx = jsx.replace(/\sreadOnly=""/g, " readOnly");
  jsx = jsx.replace(/\sdisabled=""/g, " disabled");
  jsx = jsx.replace(/\schecked=""/g, " checked");
  jsx = jsx.replace(/\sselected=""/g, " selected");
  jsx = jsx.replace(/\sstyle="[^"]*"/g, "");
  return jsx;
}

function wrapComponent(name, jsxBody) {
  return `"use client";

export function ${name}() {
  return (
    <>
${jsxBody
  .split("\n")
  .map((line) => `      ${line}`)
  .join("\n")}
    </>
  );
}
`;
}

fs.mkdirSync(outDir, { recursive: true });

for (const page of pages) {
  const htmlPath = path.join(htmlDir, page.file);
  const html = fs.readFileSync(htmlPath, "utf8");
  const inner = extractMainInner(html);
  const jsx = htmlToJsx(inner);
  const component = wrapComponent(page.component, jsx);
  const outPath = path.join(outDir, `${page.component}.tsx`);
  fs.writeFileSync(outPath, component, "utf8");
  console.log(`Generated ${outPath}`);
}
