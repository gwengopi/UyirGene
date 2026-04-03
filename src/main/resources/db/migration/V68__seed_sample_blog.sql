-- Seed a sample blog post to demonstrate the rich text editor UI
INSERT INTO blog (
    title, short_description, content, author_name, category, tags,
    status, visibility, language, url_slug, image_url, view_count, reading_time_minutes,
    publish_date, created_at, updated_at
)
SELECT
    'Biochemical Confirmatory Tests for Foodborne Pathogens',
    'A comprehensive guide to biochemical tests used in food microbiology labs to identify and confirm common foodborne pathogens including E. coli, Salmonella, and Listeria monocytogenes.',
    '<h2>Introduction</h2>
<p>Food safety is a critical aspect of public health, requiring rigorous laboratory testing to identify and confirm the presence of <em>foodborne pathogens</em>. Biochemical confirmatory tests play a vital role in accurately identifying organisms such as <em>Escherichia coli</em>, <em>Salmonella</em>, <em>Listeria monocytogenes</em>, <em>Vibrio</em> species, and <em>Bacillus cereus</em>.</p>
<p>This guide walks through the key colony characteristics, microscopic features, and biochemical profiles for the most common foodborne pathogens encountered in food microbiology laboratories.</p>

<h2>1. Escherichia coli (E. coli)</h2>
<h3>Typical Colony Characteristics</h3>
<ul>
  <li>Metallic green sheen on EMB (Eosin Methylene Blue) agar</li>
  <li>Pink to red colonies on MacConkey agar (lactose fermenter)</li>
  <li>Flat, dry, spreading colonies with irregular edges on nutrient agar</li>
</ul>
<h3>Microscopic and Morphological Features</h3>
<p>Gram-negative short rods, non-spore-forming, motile via peritrichous flagella. Facultative anaerobe.</p>
<h3>Biochemical Confirmatory Profile (IMViC)</h3>
<table>
  <tr><th>Test</th><th>Result</th><th>Notes</th></tr>
  <tr><td>Indole</td><td><strong>Positive (+)</strong></td><td>Tryptophanase activity</td></tr>
  <tr><td>Methyl Red (MR)</td><td><strong>Positive (+)</strong></td><td>Mixed acid fermentation</td></tr>
  <tr><td>Voges-Proskauer (VP)</td><td><strong>Negative (−)</strong></td><td>No acetoin production</td></tr>
  <tr><td>Citrate (Simmon''s)</td><td><strong>Negative (−)</strong></td><td>Cannot use citrate as sole carbon source</td></tr>
  <tr><td>TSI Slant / Butt</td><td>Acid / Acid + Gas</td><td>Lactose and glucose fermentation with CO₂</td></tr>
  <tr><td>Urease</td><td>Negative (−)</td><td>Distinguishes from Proteus spp.</td></tr>
</table>

<h2>2. Salmonella spp.</h2>
<h3>Typical Colony Characteristics</h3>
<ul>
  <li>Colourless / pale colonies on MacConkey agar (non-lactose fermenter)</li>
  <li>Black-centred colonies on XLD (Xylose Lysine Deoxycholate) agar due to H₂S production</li>
  <li>Pink colonies with black centres on Bismuth Sulphite agar</li>
</ul>
<h3>Biochemical Confirmatory Profile</h3>
<ul>
  <li><strong>H₂S production:</strong> Positive on TSI — black precipitate in butt</li>
  <li><strong>Urease:</strong> Negative (key distinction from <em>Proteus</em>)</li>
  <li><strong>Lysine decarboxylase:</strong> Positive</li>
  <li><strong>Indole:</strong> Negative</li>
  <li><strong>Citrate:</strong> Usually positive</li>
  <li><strong>Serological confirmation:</strong> Agglutination with polyvalent O antiserum</li>
</ul>

<h2>3. Listeria monocytogenes</h2>
<h3>Typical Colony Characteristics</h3>
<ul>
  <li>Small, grey-white colonies on PALCAM or Oxford agar</li>
  <li>Narrow zone of beta-hemolysis on sheep blood agar</li>
  <li>Blue-green metallic sheen under oblique illumination (Henry''s illumination)</li>
</ul>
<h3>Microscopic and Morphological Features</h3>
<p>Small Gram-positive rods, non-spore-forming, with characteristic <em>tumbling motility</em> at 25°C (umbrella-shaped growth in semi-solid agar). Motility absent or reduced at 37°C.</p>
<blockquote>
  <strong>CAMP Test:</strong> Enhanced hemolysis (arrowhead zone) adjacent to <em>Staphylococcus aureus</em> streak — hallmark confirmatory result for <em>Listeria monocytogenes</em>. Negative with <em>Rhodococcus equi</em> (used to differentiate from <em>L. ivanovii</em>).
</blockquote>
<h3>Key Biochemical Results</h3>
<ul>
  <li><strong>Catalase:</strong> Positive</li>
  <li><strong>Oxidase:</strong> Negative</li>
  <li><strong>Rhamnose fermentation:</strong> Positive (distinguishes from <em>L. innocua</em>)</li>
  <li><strong>Xylose fermentation:</strong> Negative</li>
</ul>

<h2>4. Staphylococcus aureus</h2>
<h3>Typical Colony Characteristics</h3>
<ul>
  <li>Golden-yellow pigmented colonies on nutrient agar</li>
  <li>Clear zones of beta-hemolysis on blood agar</li>
  <li>Black colonies with yellow halo on Baird-Parker agar (tellurite reduction + lecithinase activity)</li>
</ul>
<h3>Confirmatory Tests</h3>
<table>
  <tr><th>Test</th><th>Result</th></tr>
  <tr><td>Coagulase (tube test, 37°C / 4h)</td><td><strong>Positive (+)</strong></td></tr>
  <tr><td>Thermonuclease (DNase)</td><td><strong>Positive (+)</strong></td></tr>
  <tr><td>Catalase</td><td>Positive (+)</td></tr>
  <tr><td>Mannitol fermentation (anaerobic)</td><td>Positive (+)</td></tr>
  <tr><td>Protein A detection (latex agglutination)</td><td>Positive (+)</td></tr>
</table>

<h2>Common Biochemical Tests — Quick Reference</h2>
<table>
  <tr><th>Test</th><th>Principle</th><th>Positive Result Indicator</th></tr>
  <tr><td>IMViC (Indole)</td><td>Tryptophan → Indole via tryptophanase</td><td>Red ring (Kovac''s reagent)</td></tr>
  <tr><td>IMViC (Methyl Red)</td><td>Mixed acid fermentation lowers pH ≤ 4.4</td><td>Red colour after MR addition</td></tr>
  <tr><td>IMViC (VP)</td><td>Acetoin production from glucose</td><td>Pink/red colour (Barritt''s reagents)</td></tr>
  <tr><td>TSI Agar</td><td>Sugar fermentation + H₂S production</td><td>Slant/butt colour change + blackening</td></tr>
  <tr><td>Urease</td><td>Urea hydrolysis releases NH₃</td><td>Phenol red turns pink/magenta</td></tr>
  <tr><td>Oxidase</td><td>Cytochrome c oxidase activity</td><td>Purple colour within 10 seconds</td></tr>
  <tr><td>Coagulase</td><td>Fibrinogen → Fibrin clot</td><td>Clot formation in tube test</td></tr>
  <tr><td>CAMP Test</td><td>Synergistic hemolysis with S. aureus</td><td>Arrowhead / enhanced hemolysis zone</td></tr>
</table>

<h2>Frequently Asked Questions</h2>
<h3>Why are biochemical tests necessary after culture isolation?</h3>
<p>Morphological appearance alone is insufficient to identify foodborne pathogens at the species level. Colony morphology can be similar across many organisms. Biochemical tests confirm metabolic properties unique to each organism, ensuring accurate, reproducible, and legally defensible results that meet regulatory standards such as <strong>ISO 11290</strong>, <strong>ISO 6579</strong>, and <strong>ISO 6888</strong>.</p>
<h3>How long do confirmatory tests take?</h3>
<p>Most standard biochemical tests require <strong>18–24 hours</strong> of incubation. Rapid automated systems (API 20E strips, VITEK® 2, MALDI-TOF MS) can deliver reliable results in <strong>4–8 hours</strong>, significantly reducing turnaround time in high-throughput food testing laboratories.</p>
<h3>What is the gold standard for final confirmation?</h3>
<p>Serological typing (antigen–antibody agglutination) combined with biochemical profiling remains the regulatory gold standard. Molecular methods such as <strong>real-time PCR</strong> and <strong>whole-genome sequencing (WGS)</strong> are increasingly used for outbreak investigations and strain traceability.</p>',
    'Editorial Team',
    'Research',
    'food safety, microbiology, biochemical tests, pathogens, HACCP, food microbiology',
    'PUBLISHED',
    'PUBLIC',
    'en',
    'biochemical-confirmatory-tests-for-foodborne-pathogens',
    'https://images.pexels.com/photos/3938022/pexels-photo-3938022.jpeg?auto=compress&cs=tinysrgb&w=1200',
    0,
    8,
    NOW(),
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM blog WHERE url_slug = 'biochemical-confirmatory-tests-for-foodborne-pathogens');

-- Patch existing blog: ensure published + image (sections set in V70 after column is added by V69)
UPDATE blog
SET
    status               = 'PUBLISHED',
    visibility           = 'PUBLIC',
    reading_time_minutes = 8,
    image_url            = 'https://images.pexels.com/photos/3938022/pexels-photo-3938022.jpeg?auto=compress&cs=tinysrgb&w=1200'
WHERE url_slug = 'biochemical-confirmatory-tests-for-foodborne-pathogens';
