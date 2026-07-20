import fs from "node:fs";
import path from "node:path";

const OUTPUT_DIR = path.join(process.cwd(), "public", "course-covers");

const COURSE_IMAGE_SOURCES = {
  "COM100-computing": "photo-1544383835-bda2bc66a55d",
  "COM101-computing": "photo-1461749280684-dccba630e2f6",
  "COM104-computing": "photo-1551288049-bebda4e38f71",
  "COM105-computing": "photo-1558494949-ef010cbdcc31",
  "COM110-computing": "photo-1620712943543-bcc4688e7485",
  "BUS100-business": "photo-1554224155-6726b3ff858f",
  "BUS101-business": "photo-1522071820081-009f0129c71c",
  "BUS102-business": "photo-1460925895917-afdab827c52f",
  "BUS105-business": "photo-1611974789855-9c2a0a7236a3",
  "BUS107-business": "photo-1573496359142-b8d87734a5a2",
  "BUS112-business": "photo-1504868584819-f8e8b4b6d7e3",
  "ENG100-engineering": "photo-1581094794329-c8112a89af12",
  "ENG101-engineering": "photo-1509228468518-180dd4864904",
  "ENG102-engineering": "photo-1581091226825-a6a2a5aee158",
  "ENG103-engineering": "photo-1518770660439-4636190af475",
  "ENG108-engineering": "photo-1581092160562-40aa08e78837",
  "ENG109-engineering": "photo-1558618666-fcd25c85cd64",
  "LAW100-law": "photo-1451187580459-43490279c0fa",
  "LAW102-law": "photo-1456513080510-7bf3a84b82f8",
  "LAW105-law": "photo-1485827404703-89b55fcc595e",
  "LAW106-law": "photo-1523240795612-9a054b0db644",
  "LAW109-law": "photo-1516116216624-53e697fedbea",
  "HEA100-health-science": "photo-1576091160399-112ba8d25d1d",
  "HEA101-health-science": "photo-1579684385127-1ef15d508118",
  "HEA103-health-science": "photo-1522202176988-66273c2fd55f",
  "HEA107-health-science": "photo-1521737604893-d14cc237f11d",
  "HEA110-health-science": "photo-1552581234-26160f608093",
  "SOC100-social-science": "photo-1507003211169-0a1dd7228f2d",
  "SOC101-social-science": "photo-1677442136019-21780ecad995",
  "SOC102-social-science": "photo-1503676260728-1c00da094a0b",
  "SOC105-social-science": "photo-1553877522-43269d4ea984",
  "COM100-communication": "photo-1563986768609-322da13575f3",
  "COM101-communication": "photo-1551434678-e076c223a692",
  "COM103-communication": "photo-1486312338219-ce68d2c6f44d",
  "COM105-communication": "photo-1504384308090-c894fdcc538d",
  "HOS100-hospitality": "photo-1414235077428-338989a2e8c0",
  "HOS101-hospitality": "photo-1600880292203-757bb62b4baf",
  "HOS104-hospitality": "photo-1556761175-b413da4baf72",
  "HOS107-hospitality": "photo-1566073771259-6a8506099945",
  "LAN100-language": "photo-1456513080510-7bf3a84b82f8",
  "LAN101-language": "photo-1552664730-d307ca884978",
  "LAN104-language": "photo-1523240795612-9a054b0db644",
  "LAN112-language": "photo-1555066931-4365d14bab8c",
  "BUI100-built-environment": "photo-1504307651254-35680f356dfd",
  "BUI102-built-environment": "photo-1581094794329-c8112a89af12",
  "BUI104-built-environment": "photo-1581091226825-a6a2a5aee158",
  "ACC100-accountancy": "photo-1551434678-e076c223a692",
  "ACC101-accountancy": "photo-1554224155-8d04cb21cd6c",
  "ACC104-accountancy": "photo-1460925895917-afdab827c52f",
  "ACC105-accountancy": "photo-1554224155-6726b3ff858f",
  "GEN100-general": "photo-1521737604893-d14cc237f11d",
  "GEN102-general": "photo-1522202176988-66273c2fd55f",
  "GEN103-general": "photo-1481627834876-b7833e8f5570",
  "GEN105-general": "photo-1556761175-b413da4baf72",
};

async function downloadCourseImages() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const failures = [];

  for (const [courseId, photoId] of Object.entries(COURSE_IMAGE_SOURCES)) {
    const outputPath = path.join(OUTPUT_DIR, `${courseId}.jpg`);
    if (fs.existsSync(outputPath)) {
      continue;
    }

    const url = `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=800&h=480&q=80`;
    const response = await fetch(url);

    if (!response.ok) {
      failures.push(`${courseId}: ${photoId} (${response.status})`);
      continue;
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    fs.writeFileSync(outputPath, buffer);
    console.log(`Saved ${courseId}.jpg`);
  }

  if (failures.length > 0) {
    console.error("Failed downloads:");
    failures.forEach((line) => console.error(line));
    process.exitCode = 1;
  }
}

downloadCourseImages();
