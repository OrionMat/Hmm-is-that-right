import { readFileSync } from "fs";
import { SourcePages } from "src/dataModel/dataModel";
import { parseHtml } from "./parseHtml";

let sourcePages: SourcePages = JSON.parse(
  readFileSync("src/service/parseHtml/sourcePages.json", "utf8")
);
const bbcParagraphs = [
  'A 2,000-year-old device often referred to as the world\'s oldest "computer" has been recreated by scientists trying to understand how it worked.',
  "The Antikythera Mechanism has baffled experts since it was found on a Roman-era shipwreck in Greece in 1901.",
  "The hand-powered Ancient Greek device is thought to have been used to predict eclipses and other astronomical events.",
  "But only a third of the device survived, leaving researchers pondering how it worked and what it looked like.",
  "The back of the mechanism was solved by earlier studies, but the nature of its complex gearing system at the front has remained a mystery.",
  "Scientists from University College London (UCL) believe they have finally cracked the puzzle using 3D computer modelling. They have recreated the entire front panel, and now hope to build a full-scale replica of the Antikythera using modern materials.",
  "On Friday, a paper published in Scientific Reports revealed a new display of the gearing system that showed its fine details and complex parts.",
  '"The Sun, Moon and planets are displayed in an impressive tour de force of ancient Greek brilliance," the paper\'s lead author,  Professor Tony Freeth, said.',
  '"Ours is the first model that conforms to all the physical evidence and matches the descriptions in the scientific inscriptions engraved on the mechanism itself," he added.',
  "The mechanism has been described as an astronomical calculator as well as the world's first analogue computer. It is made of bronze and includes dozens of gears.",
  "The back cover features a description of the cosmos display, which shows the motion of the five planets that were known at the time the device was built.",
  "But only 82 fragments - amounting to around a third of the device - survived, This meant scientists have had to piece together the full picture using X-Ray data and an Ancient Greek mathematical method.",
  "X-rays probe world's oldest 'computer'",
];
const nytParagraphs = [
  [
    "A piece of crumpled paper, in all of its creased fragmentations, suffers from “geometric frustration.” Who among us can’t sympathize?",
    "In a sense, creases happen when a thin sheet of material gets claustrophobia. “New creases form if a sheet doesn’t comfortably fit into its confined area,” said Jovana Andrejević, a Ph.D. student in applied physics at Harvard and the lead author of a new paper detailing the latest advances in paper crumpling.",
    "“The sheet is stressed, so something needs to happen to relieve that stress,” Ms. Andrejević said. She was speaking from her childhood home outside Chicago, where she is living temporarily with her parents and her twin sister, Nina, who is pursuing a Ph.D. in materials science at the Massachusetts Institute of Technology. “The formation of a crease is how the stress is relieved,” Ms. Andrejević said. “The role of the creases is effectively to protect as much of the sheet as possible from further damage.”",
    "Those protected areas — the “facets” — and how they break into smaller and smaller fragments when recrumpled are the focus of the new study. Published on Friday in Nature Communications, the investigation builds on a 2018 study by some of the same researchers. The earlier study showed how paper crumpling — a seemingly random, disordered and complex process — displays a surprising amount of mathematical order. This result represented “a remarkable reduction in complexity,” the researchers noted in their 2018 paper.",
    "Crumpled paper is a proxy for much more than our pandemic angst. Similar dynamics are at play, for instance, in the wrinkling of graphene sheets for high-performance batteries; the flexibility of wearable electronic devices and artificial skin, and the folding of Earth’s crust.",
    "The 2018 study showed that the cumulative total length of all creases — the “mileage” — on a crumpled sheet served as a predictor of how the sheet would behave when crumpled again and again.",
    "Although the researchers crumpled a sheet as many as 70 times, after a few cycles it was difficult to see any difference, from one crumple to the next. But by tracking and analyzing the mileage, they noticed that a sheet never stopped forming creases, although it did so at a logarithmic rate, adding fewer creases with each recrumpling.",
    "Perhaps the most unexpected aspect of the original finding was the element of “universality,” according to Chris Rycroft, an applied mathematician and principal investigator on both papers. Two separate sheets, crumpled the same way, develop visually distinct crease patterns but rack up comparable overall mileage. “It’s very surprising the mileage is largely independent of the crease pattern,” he said.",
    "But what was the why — the physics — behind this property? “At the time, everyone was mystified by this finding,” Dr. Rycroft said. The new study “solves this conundrum and explains why.”",
    "Revisiting data from the 2018 crumpling experiments, the team initially tried to tease out more information from the creases. Did creases tend to align with one another? Was there a correlation between the orientation of creases and the direction along which a sheet was crumpled? This line of investigation didn’t yield much insight.",
    "Instead, they focused on the facets — the areas outlined by the creases. This approach seemed unlikely to succeed; it was simply too hard. Creases can be messy and irregular, making the contours they define tricky to isolate and identify. In turn, the noisy data made it particularly difficult for automated methods to accurately catalog the facets.",
    "Ms. Andrejević solved this problem, Dr. Rycroft said, “in spectacular style, by tracing the facets all out by hand.” Shmuel Rubinstein, also a principal investigator, now based at the Hebrew University of Jerusalem, said it was “a herculean effort, really, requiring a ton of work, and a ton of conviction.”",
    "On average, the sheets of elastoplastic Mylar (about four-by-four inches square) possessed 880 facets; one specimen contained 3,810. As children in Serbia, Ms. Andrejević and her sister loved drawing. These days, their artistic focus is communicating science through graphic design and data visualization. (They are very close, and often discuss ideas with each other.) Ms. Andrejević used some of her drawing tools — not paper and colored pencils, but her tablet, Adobe Illustrator and Photoshop — to wrangle the contours of the creases. She hand-traced crease patterns for 24 scanned sheets, 21,110 facets in total.",
    "By the end, she felt as if she were seeing fragmentation everywhere, and in the most unexpected places — walking home from the lab one day, she saw a resemblance in a tiling pattern decorating a trash can.",
    "In the summer of 2019, Ms. Andrejević and Dr. Rycroft developed the facet analysis into a theory while visiting the Lawrence Berkeley National Laboratory in Berkeley, Calif., where Dr. Rycroft holds a visiting position. During hikes on the weekend, they found inspiration in the natural world, looking at eroding rockslides and pebbled beaches.",
    "Around the same time Ms. Andrejević delved into the scientific literature on fragmentation theory, which explores the physical principles explaining how materials (rock, glass, volcanic debris, meteorites) break into smaller and smaller pieces. The theory provides a way of characterizing the resulting fragments. For example, as fragmentation progresses, materials — regardless of their starting point — quickly tend toward a predictable “steady-state” distribution of fragment sizes.",
    "Ms. Andrejević and her collaborators wondered whether the evolution of crumpling paper could be described by the same principles and statistical trends.",
    "After hand-tracing the facets of the scanned sheets on her tablet, Ms. Andrejević colored each segment by area, and then sorted them by size. A familiar order-amid-disorder emerged. Comparing one sheet to the next, she noticed that, despite their differing crease patterns, the size distributions of facets were similar. Furthermore, the size distribution of facets fit perfectly with the predictions of fragmentation theory.",
    "This provided a theoretical underpinning for the behavior seen in the experimental study from 2018. “We were very excited about this result because it supports the idea that there is some universality across diverse disordered systems,” Ms. Andrejević said.",
    "To confirm these findings, the team did some verification experiments. Lisa Lee, then a Ph.D. student, started with a fresh sheet of paper and folded it into a five-by-five grid of square facets, all of equal area; compared with a typical crumpling in the experiment, this produced a very different size distribution of facets.",
    "Dr. Lee then opened the folded sheet and subjected it to the usual regimen of crumpling, recrumpling and recrumpling some more. “Even after just a single crumple, the facets closely resembled the distribution predicted by our model,” said Dr. Lee, who is now doing research and development at ThermoFisher Scientific. The facets quickly fell in line with the classic fragmentation distribution, and thereafter followed the same universal evolution.",
    "This shows how, in a fragmentation process, any special pattern of fragment sizes is rapidly washed out — vanishing after a single crumple, in the case of the grid folding. Technically speaking, this means the steady-state distribution of sizes is a “strong attractor,” a state toward which a system tends to evolve.",
    "This further explained why the overall “mileage” would exhibit universal behavior and predict the evolution of the crease network.",
    "However, one piece of the puzzle was still missing: an explanation of the physical dynamics.",
    "“We found our answer by incorporating some geometry,” Ms. Andrejević said. Given a sheet’s crease pattern after, say, nine crumples, and given the geometry of its confinement when crumpled again, the researchers could predict how much new damage would occur during the 10th crumple — that is, what the sheet would look like after enduring yet another round of “geometric frustration.”",
    "By the end of their summer research, in July, Ms. Andrejević and Dr. Rycroft sent their theory — in a document named “crumpling_math_model” — to Dr. Rubinstein. “I was blown away,” Dr. Rubinstein recalled.",
    "In fact, they were all surprised that fragmentation theory proved so effective. “To the best of our knowledge this is the first application of such concepts to describe crumpling,” the authors wrote in their paper.",
    "“It is a beautiful contribution,” said Jean-François Molinari, an engineer at the Swiss Federal Institute of Technology Lausanne whose recent research focuses on friction and fracture. “The analogy to fragmentation is quite creative. This is what physics is all about: finding simplicity in complex patterns, and finding analogies between seemingly disconnected fields.”",
    "Yet for Dr. Rubinstein and the team, fragmentation is only part of the answer. Still to be revealed are the rules of crumpling.",
    "Ms. Andrejević is refining a computer simulation that will help, the researchers hope, in finally figuring out the crumpling problem — in part by generating data that is otherwise cumbersome to acquire with crumpling and recrumpling experiments in the lab.",
    "In 2019, the team made some headway using machine learning, with an investigation that asked: Given the ridges in a crumpled sheet, could artificial intelligence predict the valleys?",
    "“The idea was that if the A.I. could predict one from the other, this will mean that there are geometrical rules (and not only statistical) to the formation of the crease network, like in Japanese origami,” Dr. Rubinstein noted. The main result showed that the computer, if given some rules of folding origami, does much better at “learning” crumpling.",
    "“We learned a lot from that study, but I can’t honestly say we learned the rules of crumpling,” Dr. Rubinstein said. “We believe that with reliable numerical simulations we will be able to go much farther.”",
    "For instance, the curious, constant crumpler asks: Which areas of a repeatedly crumpled sheet are most likely to get new creases and which areas are “safe”? Which part of the sheet will be in the center of the crumpled ball, and which part will be more toward the edges?",
    "Although these are simple questions, Dr. Rycroft said, “I think there’s great beauty in how such simple questions can have so many practical ramifications.”",
    "Crumpling belongs to the family of “compaction” questions, which probe, for instance, how viral RNA is packed in a protein capsid. And understanding how and why materials fail is vital, whether those materials are new metallic alloys or the thin-walled structures of cars and silos.",
    "Dr. Rycroft’s group studies bulk metallic glasses, or B.M.G.s — materials composed of atoms with a structure that is random and amorphous rather than orderly and crystalline. The disorder lends itself to high-strength and wear-resistant properties, which could benefit a wide range of applications, from smartphone cases to aircraft components.",
    "B.M.G.s, however, are known to sometimes fail. “They can develop networks of thin shear bands that are precursors to outright failure,” Dr. Rycroft said. The failure properties are complex and not well understood, which limits practical use, he noted.",
    "But the patterns formed by shear bands are reminiscent of crease network patterns. This led the researchers to speculate whether their crumpling fragmentation model might apply — and help in designing to avoid failure. Who among us can’t sympathize?",
  ],
  [
    "Thank you for your letters of concern. The news reports had it right: I was indeed abducted by aliens last weekend, but the food was excellent, there was flatbed seating in the spacecraft, and they got me back for the premiere of “The Affair.” And for those of you who are wondering: Alien sex is very hot. They also have no problem with commitment. The fellow (that’s an approximation) I hooked up with has already made a date with me when the visitors from another galaxy swing by here again, in 300 years.",
    "But you are no doubt wondering why the aliens sought me out. It was about the Hudson River Greenway, which is visible for thousands of miles in space. The aliens were horrified, last fall, when large cement barriers were plunked down in the middle of the shared bike and pedestrian paths. It destroyed the beauty of the park. It also hampered their view. You see, just as we have Showtime and Netflix, the aliens like to kick back and watch Earth and Mars. But as the programming on Mars lacks tension, a narrative arc and all signs of life, that leaves Earth.",
    "“We plain do not understand it,” the alien told me. “Every year the Hudson River Greenway became lusher: flowers, landscaping, sculpture. That mass of orange and yellow tulips next to Chelsea Piers this spring; it was so pretty I had to wipe a few tears from my elbow. Truly, we never saw a more beautiful fight arena. Even that round building in Washington.”",
    "“Congress,” I said. “But you’re not understanding the purpose of the Greenway path. It’s true there are sometimes fights there. You’ve got these testosterone-spraying serious bikers — ”",
    "“ — The Screaming Lycra-Legged Mad Men!” the alien interrupted, excitedly. “It is said they grab infants from the arms of the mothers who dare impinge upon the path and heave them into the Hudson.”",
    "“That’s galactic legend,” I said. “New York mothers do not carry infants; fathers do in order to score sensitivity points. You see it a lot Sunday mornings, when they do bagel runs. Let’s get back to the Greenway bike path. Where were we?”",
    "“The Screaming Lycra-Legged Mad Men,” the alien said. “But what is testosterone?”",
    "“It’s a substance manufactured in the bodies of men — those earth creatures who have just one of the three things you have — which allows them to rise to the top of their professions even when women are better qualified,” I said. “It also makes them aggressive. This is why you hear Lycra-Legged Mad Men screaming at people. But they generally do not get off the bike and slug it out. It slows down their time. It’s when they crash into someone you’ll see fights.”",
    "“Yes,” the alien said. “I have seen some memorable bouts between Thermal Pack Carriers of Foodstuffs and the Lycra-Legged. Their expletives were extraordinarily foul. We would print them in one of our own newspapers, but our culture is more advanced. The Lycra-Legged Mad Men and the Thermal Pack Carriers are natural enemies are they not?”",
    "“We call them food delivery guys,” I said. “They have to be fast so they use electric bikes and ignore one-way street signs and stop lights. We fear them more than Scooter Brats, those squat creatures who dart at our ankles like insects but which, unlike insects, we are forbidden to swat.”",
    "“We know the Scooter Brats well,” the alien said. “I made some major money in a side bet involving a Scooter Brat and a Lycra-Legged Screamer. The Screamer was approaching warp speed south of the boat basin when a Scooter Brat flashed out of the playground. The Lycra-Legged Screamer swerved, clipped a nun on a Unicycle and was impaled on a selfie stick. I’ve got in on my phone, want to see?”",
    "“If we can get back to the cement barriers,” I said.",
    "“I’m all ears,” the alien said. “That doesn’t freak you out anymore, does it?”",
    "“No,” I said. “I was just surprised to find so many on your shoulders. But now that I know I don’t have to blow in every one of them I’m cool. O.K., some history: the cement barriers were put up on the bike path last fall, after a terrorist drove a pickup truck onto the path, killing eight people. It was horrible. The idea was that if we put up barriers that could never happen again.”",
    "“But many of the barricades are in the middle of the path, not the sides,” the alien said. “Doesn’t that severely minimize the space?”",
    "“Yes, it does,” I said. “It’s also a little scary, especially when a Lycra-Leg comes racing through. If you fall, you hit a cement wall. But what choice do we have? Take down the barriers just so we can have a relaxed ride alongside a beautiful park? What kind of message does that send our enemies? Anyway, from an entertainment point of view, the barriers have made the conflicts on the path more entertaining and ferocious.”",
    "“That’s true,” the alien said. “That stretch where the ocean liners dock and you have the Debarking Wheelie Baggers, the Clueless Tourists, and the Lycra-Legged — our sports bars are packed when those ships come in. I bet I kick back a dozen Tide Pod shots.”",
    "“You drink those?” I said.",
    "“What do you think I have all those ears for?” the alien said.",
    "“Got it,” I said. “By the way, I’ve been wondering. There are so many bikers on the Greenway, why did you choose me to ask about the barriers?”",
    "“It’s the way you wobble when you ride,” the alien said. “Nobody in New York City wobbles as much as you. That’s the sign of a superior biker, is it not?”",
    "“Absolutely,” I said.",
  ],
];
const reutersParagraphs = [
  "By Luis Felipe Castilleja, Jordi Rubio",
  "2 Min Read",
  "LA GARRIGA, Spain (Reuters) - A Spanish chess board maker discovered by chance that its products played a cameo role in hit Netflix series “The Queen’s Gambit”, and its sales have since soared.",
  "“One day I came into work and a colleague, Miguel, told me that Netflix had released a new series ‘The Queen’s Gambit’ and some Rechapados Ferrer boards appeared in the trailer,” said David Ferrer, 30, who runs Rechapados Ferrer.",
  "The series, based on the 1983 novel by Walter Tevis, debuted in October 2020 and fast became a hit.",
  "It follows orphaned chess prodigy Beth Harmon as she takes on the male-dominated world of chess.",
  "A triumphant finale takes her to Moscow to play one of the Soviet Union’s star players. It is in this pivotal scene that the distinctive Rachapados Ferrer chess board takes centre stage.",
  "Viewers have been keen to buy a piece of the action, boosting sales already on the rise due to demand linked to strict COVID-19 lockdowns.",
  "The company based in La Garriga, near Barcelona, has already doubled its annual orders from around 22,000 in 2020 to 45,000 for 2021 and has now moved any new orders to 2022.",
  "“Orders of chess boards have skyrocketed,” said Ferrer, whose grandfather founded the company in the 1950s. “This year is full in terms of production.”",
  "Ferrer told Reuters the board that appears in the finale has become one of the most requested, but is so far only available through one German distributor. It was through them that the series - much of which was filmed in Berlin - got the boards.",
  "But with demand booming and chess more popular than ever, Ferrer says the company might try to sell the board through other channels too.",
  "Writing by Jessica Jones; Editing by Ingrid Melander and Mike Collett-White",
  "Our Standards: The Thomson Reuters Trust Principles.",
];
const apParagraphs = [
  "BOSTON (AP) — Neil Diamond posts a fireside rendition of “Sweet Caroline” with its familiar lyrics tweaked to say, “Hands ... washing hands.” A news anchor asks when social distancing will end because “my husband keeps trying to get into the house.” And a sign outside a neighborhood church reads: “Had not planned on giving up quite this much for Lent.”",
  "Are we allowed to chuckle yet? We’d better, psychologists and humorists say. Laughter can be the best medicine, they argue, so long as it’s within the bounds of good taste. And in a crisis, it can be a powerful coping mechanism.",
  "“It’s more than just medicine. It’s survival,” said Erica Rhodes, a Los Angeles comedian.",
  "“Even during the Holocaust, people told jokes,” Rhodes said in a telephone interview with The Associated Press. “Laughter is a symbol of hope, and it becomes one of our greatest needs of life, right up there with toilet paper. It’s a physical need people have. You can’t underestimate how it heals people and gives them hope.”",
  "For most people, the new coronavirus causes mild or moderate symptoms, such as fever and cough that clear up in two to three weeks. For some, especially older adults and people with existing health problems, it can cause more severe illness, including pneumonia, and death.",
  "Those are scary words and scary prospects. But history has shown that its heaviest moments are often leavened by using humor and laughter as conscious choices — ways to cope when other things aren’t working as expected. ",
  "“There’s so much fear and horror out there. All the hand washing in the world isn’t going to clear up your head,” said Loretta LaRoche, a suburban Boston stress management consultant who’s using humor to help people defuse the anxiety the pandemic has wrought.",
  "“Some people will say this is not a time for laughter. The bottom line is, there is always a time for laughter,” LaRoche said. “We have 60,000 thoughts a day and many of them are very disturbing. Laughter helps the brain relax.”",
  "That explains why social media feeds are peppered with coronavirus-themed memes, cartoons and amusing personal anecdotes.",
  "Here’s Diamond posting a video of himself singing “Sweet Caroline” with the lyrics altered to say: “Hands ... washing hands ... don’t touch me ... I won’t touch you.”",
  "There’s Fox News anchor Julie Banderas tweeting: “How long is this social distancing supposed to last? My husband keeps trying to get into the house.”",
  "Here’s Austin restaurant El Arroyo, still smarting economically from the outbreak-induced postponement of the South by Southwest music festival, turning its outdoor message board into a mock dating app: “Single man w/TP seeks single woman w/hand sanitizer for good clean fun.”",
  "And over here, see novelist Curtis Sittenfeld, sharing a photo of herself eating lunch in her wedding dress after her kids asked her to wear it “and I couldn’t think of a reason not to.”",
  "For centuries, laughter in tough times has been cathartic, said Wayne Maxwell, a Canadian psychologist who has done extensive research on “gallows humor.” The term originated in medieval Britain, where hangings took place in parks near pubs and patrons told jokes at the victims’ expense.",
  "“Even in some of the writings of ancient Egypt, there are descriptions of military personnel returning from the front lines and using humor to cope,” said Maxwell, of Halifax, Nova Scotia.",
  "But, he warns, there exists a kind of comedy continuum: While humor can helpfully lighten things up, too much laughter and flippancy can signal a person is trying to escape from reality.",
  "There are also questions of taste. No one wants to poke fun at medical misery or death. Quarantining and social distancing, though, are fair game, and self-deprecating humor is almost always safe — though LaRoche cautions that humor, like beauty, is always in the eye of the beholder.",
  "“It all depends on how your brain functions,” she said. “Give yourself permission to find humor. It’s almost like a spiritual practice, finding ways to laugh at yourself.”",
  "For those millions of parents struggling to work from home and teach their housebound children, she’s preaching to the choir. Witness this widely shared meme: a photo of an elderly, white-haired woman with the caption: “Here’s Sue. 31 years old, home schooling her kids for the last 5 days. Great job Sue. Keep it up.”",
  "Michael Knight, a 29-year-old musician and a caseworker for people with mental disabilities, has been breaking the tension by posting memes like: “They said a mask and gloves were enough to go to the grocery store. They lied. Everyone else had clothes on.”",
  "“It helps me decompress,” said Knight, of Plymouth, Massachusetts. “It kind of offsets the paralyzing effects of the bogeyman that is the pandemic.”",
  "Rhodes, who’s out more than $30,000 after three festivals and her first taped special were canceled, is trying to see the humor in her own predicament.",
  "She recently posted iPhone video of herself pretending to work a nonexistent crowd  on an outdoor stage she happened upon during a walk. “How’s everyone not doing?” she cracks.",
  "“The best material comes from a place that’s very truthful and somewhat dark,” Rhodes said.",
  "Her prediction: When life eventually edges back to normal, “Saturday Night Live” and the latest Netflix standup specials will be powered by quarantine humor.",
  "“Just a month ago, who would have appreciated being given a roll of toilet paper?” she said. “I mean, the whole world is upside down.”",
  "___",
  "William J. Kole is the New England editor for The Associated Press. Follow him on Twitter at http://twitter.com/billkole",
];

describe("Extract news piece information from HTML webpages", () => {
  test("Ideal case: Article information is correctly extracted", async () => {
    // run test
    const sourcePieces = await parseHtml(sourcePages);

    // asserts bbc
    expect(sourcePieces["bbc"][0].title).toEqual(
      "Scientists unlock mysteries of world's oldest 'computer'"
    );
    expect(sourcePieces["bbc"][0].date).toEqual("18 hours ago");
    expect(sourcePieces["bbc"][0].body).toEqual(bbcParagraphs);

    // asserts nyt
    expect(sourcePieces["nyt"][0].title).toEqual(
      "The Latest Wrinkle in Crumple Theory"
    );
    expect(sourcePieces["nyt"][0].date).toEqual("March 8, 2021");
    expect(sourcePieces["nyt"][0].body).toEqual(nytParagraphs[0]);
    expect(sourcePieces["nyt"][1].title).toEqual(
      "E.T. Doesn’t Like the Bike Path Either"
    );
    expect(sourcePieces["nyt"][1].date).toEqual("June 18, 2018");
    expect(sourcePieces["nyt"][1].body).toEqual(nytParagraphs[1]);

    // asserts AP
    expect(sourcePieces["ap"][0].title).toEqual(
      "If you don’t laugh, you cry: Coping with virus through humor"
    );
    expect(sourcePieces["ap"][0].date).toEqual("March 26, 2020 GMT");
    expect(sourcePieces["ap"][0].body).toEqual(apParagraphs);

    // asserts reuters
    expect(sourcePieces["reuters"][0].title).toEqual(
      "Spanish chess board sales soar after 'Queen's Gambit' cameo"
    );
    expect(sourcePieces["reuters"][0].date).toEqual(null); // NOTE: Reuters dates are difficult to get as they are in Javascript code. Can pull from meta tags.
    expect(sourcePieces["reuters"][0].body).toEqual(reutersParagraphs);
  });
});
