import type { CuratedDataset } from '../types/curator'
import { ask, sec } from './section'

/** Public tables whose subject is the reason to open them. The study draw weights these above textbook sets. */
export const curatedUnusual: CuratedDataset[] = [
  {
    ref: 'aravinii/duolingo-spaced-repetition-data',
    title: 'Duolingo Spaced Repetition',
    owner: 'Duolingo',
    topic: 'Regression',
    tags: ['Memory', 'Half-life', 'Language', 'Sessions'],
    rows: 12854228,
    rowsLabel: '13 million',
    shape: '12 columns',
    summary:
      'Thirteen million practice traces from Duolingo: a learner, a word, how long since they last saw it, and whether they recalled it. The famous question is the half-life of a word, not a generic accuracy score.',
    fileNote: 'One row is a lexeme inside a lesson. p_recall is a proportion, not a single coin flip.',
    split: {
      marker: 'Later sessions',
      trainLabel: 'Earlier',
      holdoutLabel: 'Latest',
      trainShare: 70,
      caption: 'Split on timestamp',
    },
    signal: { interview: 8, research: 8, applied: 8 },
    curiosity: 10,
    sections: {
      models: sec('good', 'Start here', [
        ['Half-life baseline', 'Fit p = 2^(-Δ / h), with h a function of times seen and times correct. This is the Settles and Meeder model. Beat it before you add a neural net.'],
        ['Language and lexeme', 'Add the language being learned and a simple lexeme embedding or prefix of the lexeme tag. Report log loss on p_recall, plus calibration.'],
        ['User holdout', 'Also hold out entire users. A timestamp split still lets the same learner appear on both sides, which flatters a memorizer.'],
      ]),
      statistics: sec('good', 'Included', [
        ['Delta is skewed', 'The gap since last practice has a long right tail. Log-transform it in any linear model, and show recall against log days.'],
        ['Proportion outcomes', 'session_correct over session_seen is a rate. A row with one exposure is not the same evidence as a row with twenty. Weight or model the counts.'],
      ]),
      interviews: ask('good', 'Screen ready', [
        [
          'Half-life',
          'Each row records a learner, a word, the seconds since they last practiced it, and the share of drills they got right this time. A model that ignores the gap will look strong on frequent words and fail the moment practice pauses for a week.',
          'How would you estimate how fast a word is forgotten, and what would you refuse to claim from a single session?',
          'Fit a half-life so recall decays as a power of two in the gap, using past exposures as the strength of the memory. Report calibration of the predicted proportion. A single session is one noisy rate, so the claim is about the decay curve, not that this learner will miss this word tomorrow.',
        ],
        [
          'Leakage',
          'history_seen and history_correct are counts from before this lesson. session_seen and session_correct are from the lesson that produced p_recall. Using the session counts to predict the session rate is circular.',
          'Which columns are known before the lesson, and which ones are the outcome in disguise?',
          'Keep the history counts, the gap, the languages, and the lexeme. Drop session_seen and session_correct from the features, because p_recall is their ratio. If a feature moves in lockstep with the label on the same row, it is not a predictor.',
        ],
        [
          'New learner',
          'A new account has no history counts and no personal half-life. The product still has to schedule the first reviews. Pooling everyone into one decay curve ignores that some learners are on day one and some are on day four hundred.',
          'What do you schedule for a learner with an empty history?',
          'Use a population half-life for that language and word difficulty, then shrink toward the learner’s own curve as history_seen grows. Say plainly that the first sessions are a prior, not a personal memory estimate.',
        ],
      ]),
      research: sec('idle', 'Ideas', [
        ['Forgetting curves', 'Compare an exponential half-life with a power-law curve on the same time split. The practical difference is the review interval the app would pick at 30 days.'],
        ['Language transfer', 'Ask whether an English-speaking learner of Spanish shares a decay shape with an English-speaking learner of Japanese, after you condition on history.'],
      ]),
      applications: sec('good', 'In practice', [
        ['Review queue', 'The same decay model is how a language app decides which word to show tonight. The output is an interval, not a grade.'],
        ['Content difficulty', 'Words whose half-life stays short after many correct recalls are candidates for a better example sentence, not for pushing the learner harder.'],
      ]),
    },
  },
  {
    ref: 'rohanrao/formula-1-world-championship-1950-2020',
    title: 'Formula 1 World Championship',
    owner: 'Rohan Rao',
    topic: 'Regression',
    tags: ['Race pace', 'Grid', 'Circuits', 'Era'],
    rows: 26000,
    rowsLabel: '26 thousand',
    shape: '14 tables',
    summary:
      'Every Formula 1 World Championship race since 1950: grid, finish, constructor, circuit, and lap-level tables for later seasons. A clean place to study race outcomes without pretending the car is a black box.',
    fileNote: 'results.csv is one row per driver per race. Lap times and pit stops are separate tables.',
    split: {
      marker: 'Later seasons',
      trainLabel: 'Earlier eras',
      holdoutLabel: 'Recent',
      trainShare: 75,
      caption: 'Split on season',
    },
    signal: { interview: 8, research: 8, applied: 7 },
    curiosity: 10,
    sections: {
      models: sec('good', 'Start here', [
        ['Grid baseline', 'Predict finishing position from grid position alone, within an era. Most of the signal is the start. A model that ignores grid is not serious.'],
        ['Constructor and circuit', 'Add constructor and circuit, with a season effect. Score mean absolute error on position, and separately the share of podiums you rank in the top 3.'],
        ['Pit and lap tables', 'Once the race-level model is honest, use pit stops and lap times for a pace question: who was fast, not who the rules later classified.'],
      ]),
      statistics: sec('good', 'Included', [
        ['Era shift', 'A win in 1955 and a win in 2024 are not the same data-generating process. Points systems, reliability, and field size all moved. Fit separate eras or a season spline.'],
        ['Did not finish', 'A large share of historical rows are mechanical retirements. Model classified finish and retirement as two outcomes, or the position regression is dominated by DNF codes.'],
      ]),
      interviews: ask('good', 'Screen ready', [
        [
          'Grid baseline',
          'Qualifying already sorts the field. A model that “predicts” the winner from the full race lap times has seen the race. The decision a fan or a desk can make is before lights out, when only the grid, the car, and the circuit are known.',
          'What baseline would you insist on before you trust a fancy race model?',
          'Grid position within the same era. Report how much mean absolute error drops after constructor and circuit are added. If the lift is tiny, the extra model is not earning its place.',
        ],
        [
          'Rule changes',
          'Points, refueling, tires, and aero packages change the sport underneath a stable column name. A random split puts 2023 cars into the training story for 1962 races and flatters the score.',
          'How do you stop a rule change from leaking into the test?',
          'Cut by season, and keep an entire era out of training when the question is about the modern car. State which regulations the test seasons actually lived under.',
        ],
        [
          'Retirement',
          'A driver who stops on lap 4 has a status code, not a slow finishing position. Treating that code as position 20 teaches the model that unreliable cars are “slow,” which is a different mechanism.',
          'How should a retirement enter the target?',
          'Model the chance of classification first, then the position among classified finishers. Report both. A single regression on raw position mixes reliability with pace.',
        ],
      ]),
      research: sec('idle', 'Ideas', [
        ['Home circuits', 'Estimate a driver or constructor effect at their home track after grid is accounted for. The interesting residue is small and easy to overclaim.'],
        ['Safety and DNF', 'The decline in mechanical and accident retirements is a historical series. Fit it as a rate by decade, not as a driver-skill score.'],
      ]),
      applications: sec('idle', 'In practice', [
        ['Broadcast brief', 'A desk uses grid plus a constructor prior to frame the start. The model is a sentence about the grid, not a betting engine.'],
        ['Season review', 'The same tables support a fair ranking of pace once retirements are separated from finishing order.'],
      ]),
    },
  },
  {
    ref: 'patelris/spacex-launches-rockets-and-starlink-dataset',
    title: 'SpaceX Launches',
    owner: 'patelris',
    topic: 'Classification',
    tags: ['Landing', 'Reuse', 'Payload', 'Pads'],
    rows: 205,
    rowsLabel: '205',
    shape: '3 tables',
    summary:
      'A few hundred SpaceX orbital launches with rocket, pad, payload, and whether the booster came back. Small on purpose: the work is a careful landing model, not a deep net on two hundred rows.',
    fileNote: 'Launch table is short. Starlink positions are a separate, much larger file.',
    split: {
      marker: 'Later flights',
      trainLabel: 'Early flights',
      holdoutLabel: 'Recent',
      trainShare: 70,
      caption: 'Split on launch date',
    },
    signal: { interview: 8, research: 7, applied: 7 },
    curiosity: 10,
    sections: {
      models: sec('good', 'Start here', [
        ['Landing logistic', 'Predict booster landing success from orbit type, payload mass, pad, and whether the core was already flown. Logistic regression first. With 205 rows, a forest is a footnote.'],
        ['Reuse indicator', 'A second model for whether a core is reused, as a description of the program over time. Do not feed landing success back in as a feature.'],
        ['Block effect', 'Falcon 9 blocks are different vehicles. Include the block or the year, and show the coefficient next to the mass coefficient.'],
      ]),
      statistics: sec('warn', 'Small N', [
        ['Base rate moves', 'Early flights rarely attempted a landing. Later flights usually land. A model without year will look brilliant and has only learned the calendar.'],
        ['Uncertainty', 'A 90 percent success rate on 40 recent flights is still a wide interval. Quote a binomial interval beside any point accuracy.'],
      ]),
      interviews: ask('good', 'Screen ready', [
        [
          'Small table',
          'Two hundred launches is a complete history of a company, and a tiny sample for machine learning. Accuracy on a shuffled split will look excellent because recent flights almost all succeed.',
          'What model is appropriate, and which metric would you refuse to headline?',
          'A logistic regression with a handful of pre-launch fields, scored with log loss and a confidence interval, on a time split. Refuse a single accuracy number. The honest chart is landing rate by year with an interval.',
        ],
        [
          'Attempt versus success',
          'Some flights never tried to recover the booster. Coding those as landing failures teaches the model that early missions were bad at landing, when the program had not asked the booster to come home.',
          'How do you define the landing label?',
          'Restrict the classifier to flights that attempted a landing, and report the attempt rate separately as a time series. The classification question and the “did they try” question are different decisions.',
        ],
        [
          'Starlink file',
          'The Starlink table is thousands of satellite positions. Joining it naively to launches multiplies rows and lets one mission dominate a loss. It answers a constellation question, not a landing question.',
          'When would you open the Starlink table, and when would you leave it alone?',
          'Leave it alone for landing models. Open it when the question is orbital distribution of the constellation. Never stack satellite rows into a launch classifier.',
        ],
      ]),
      research: sec('idle', 'Ideas', [
        ['Mass margin', 'Estimate how payload mass relates to landing attempts after you condition on orbit. The interesting claim is the trade, with a wide interval.'],
        ['Pad effects', 'Compare pads only after year is in the model. Otherwise the newest pad inherits the newest success rate.'],
      ]),
      applications: sec('idle', 'In practice', [
        ['Range brief', 'Recovery planning cares about attempt and sea state more than a leaderboard score. The model is a checklist input.'],
        ['Program history', 'A year-by-year landing rate is the chart a technical history actually needs.'],
      ]),
    },
  },
  {
    ref: 'agirlcoding/all-space-missions-from-1957',
    title: 'Space Missions since 1957',
    owner: 'agirlcoding',
    topic: 'Time series',
    tags: ['Launch rate', 'Country', 'Rocket', 'Success'],
    rows: 4324,
    rowsLabel: '4.3 thousand',
    shape: '8 columns',
    summary:
      'Orbital launch attempts since Sputnik: who flew, from where, on what rocket, and whether the mission succeeded. The study is a count of attempts over decades, plus a success rate that is not a moral score.',
    fileNote: 'One row per mission. Company and status are strings, and naming is inconsistent across decades.',
    split: {
      marker: 'Recent decades',
      trainLabel: '1957–2000',
      holdoutLabel: 'After 2000',
      trainShare: 68,
      caption: 'Forecast the later era',
    },
    signal: { interview: 7, research: 8, applied: 6 },
    curiosity: 9,
    sections: {
      models: sec('good', 'Start here', [
        ['Annual counts', 'Collapse to launches per year by country or company. A seasonal naive model is the wrong baseline; use a trend plus a change around the shuttle years and the 2010s commercial rise.'],
        ['Success rate', 'Model mission success with a logistic curve in year and organization. Quote the rate, not a classification accuracy on imbalanced late-era rows.'],
        ['Rocket family', 'Group rocket names into families before you fit anything. Raw strings split one vehicle into a dozen spellings.'],
      ]),
      statistics: sec('good', 'Included', [
        ['Who is counted', 'A “company” in 1965 is often a state program. Treat organization as a changing label, and show the mix of organizations by decade before you interpret a coefficient.'],
        ['Status strings', 'Success and failure are text. Partial failures and “prelaunch failure” need an explicit map, written down before modeling.'],
      ]),
      interviews: ask('good', 'Screen ready', [
        [
          'Counts first',
          'The table is a list of attempts, not a random sample of rockets. The 1960s spike and the 2010s spike are different countries doing different jobs. A single accuracy number hides that.',
          'What would you plot before you fit a model?',
          'Annual attempt counts by organization, and a success rate with a confidence band. The model comes after those two pictures agree with the history you can already narrate.',
        ],
        [
          'Name hygiene',
          'The same family appears as several strings. A dummy variable per raw rocket name spends its degrees of freedom on spelling.',
          'How do you treat rocket and company names?',
          'Map them to a family and an organization with a dictionary you can show. Put the unmapped remainder in one “other” bin and say how large it is.',
        ],
        [
          'Forecast claim',
          'A smooth trend fit through 2000 does not know that commercial reuse would change the 2010s. Holding out the later era is the test of whether the model learned history or a line.',
          'What are you willing to forecast?',
          'A short horizon of attempt counts with a wide interval, after stating that a new vehicle class breaks the model. Refuse a prediction of next year’s success rate as if the design were frozen.',
        ],
      ]),
      research: sec('idle', 'Ideas', [
        ['Commercial break', 'Estimate the change in annual attempts after a chosen commercial-era start, with a simple interrupted trend. The date of the break is a sensitivity, not a fact.'],
        ['Site concentration', 'A few ranges account for most attempts. Describe concentration over time rather than predicting individual missions.'],
      ]),
      applications: sec('idle', 'In practice', [
        ['Industry brief', 'Launch-cadence charts are how analysts describe the market. The table supports the chart, with the failure map written beside it.'],
        ['Historical comparison', 'Success rates by decade are a fair public comparison when the status map is fixed in advance.'],
      ]),
    },
  },
  {
    ref: 'nasa/meteorite-landings',
    title: 'Meteorite Landings',
    owner: 'NASA',
    topic: 'Clustering',
    tags: ['Fall vs found', 'Mass', 'Class', 'Antarctica'],
    rows: 45716,
    rowsLabel: '46 thousand',
    shape: '10 columns',
    summary:
      'Tens of thousands of meteorites with mass, class, year, and where they were recovered. The map mostly shows where people search — ice and desert — which is the analysis, not a nuisance.',
    fileNote: 'Mass and coordinates are missing on some rows. Fell versus Found is the key split.',
    split: {
      marker: 'Later finds',
      trainLabel: 'Earlier',
      holdoutLabel: 'Recent',
      trainShare: 72,
      caption: 'Split on year',
    },
    signal: { interview: 8, research: 8, applied: 5 },
    curiosity: 9,
    sections: {
      models: sec('good', 'Start here', [
        ['Search effort', 'Cluster or classify Fell versus Found from latitude, longitude, and year. The point is to show that Found tracks expeditions. Do not call the clusters “where rocks prefer to land.”'],
        ['Mass model', 'Among observed falls, model log mass from class. Report a simple group mean first. Most of the story is a heavy tail of a few huge stones.'],
        ['Class mix', 'A multinomial of recclass over decades. Composition shifts can be science or a change in what collectors keep.'],
      ]),
      statistics: sec('good', 'Included', [
        ['Antarctic pile-up', 'A kernel density of coordinates will put a mass of points on Antarctica. That is a search program. Say so in the first paragraph.'],
        ['Log mass', 'Mass spans grams to tons. Means without a log scale are one iron meteorite. Use medians and a log axis.'],
      ]),
      interviews: ask('good', 'Screen ready', [
        [
          'Found versus fell',
          'Fell means someone saw it arrive. Found means someone picked it up later. Found stones concentrate where expeditions walk, especially Antarctic ice, so a map of landings is partly a map of fieldwork.',
          'What does a hotspot on the map actually mean?',
          'Split the map by Fell and Found before you interpret it. A Found hotspot is a search-effort claim. A Fell pattern is closer to a sky claim, and even then reporting depends on populated land.',
        ],
        [
          'Missing mass',
          'Some rows have no mass, and the missingness is not random across classes and years. Dropping them quietly changes the median.',
          'How do you handle missing mass and coordinates?',
          'Report the missing rate by class and by Fell versus Found. Model log mass only on rows with mass, and keep a map that marks unknown coordinates instead of dropping those stories from the count.',
        ],
        [
          'Huge stones',
          'A handful of irons dominate any average mass. A model fit on the raw gram scale will spend itself on those points.',
          'Which summary of mass would you defend?',
          'A median and a log-scale distribution, with the largest stones listed separately. If you fit a model, fit it to log mass and show residuals for the upper tail.',
        ],
      ]),
      research: sec('idle', 'Ideas', [
        ['Expedition effect', 'Compare the class mix of Antarctic finds with observed falls. The gap is a paper about bias in the collection, which is the scientifically interesting gap.'],
        ['Year of find', 'The year column is often the year of discovery, not the year of fall. Keep that sentence next to any time trend.'],
      ]),
      applications: sec('idle', 'In practice', [
        ['Collection planning', 'Museums and surveys use the same bias story to decide where a new search adds information.'],
        ['Public map', 'A honest public map is two layers, falls and finds, with mass on a log scale.'],
      ]),
    },
  },
  {
    ref: 'arashnic/exoplanets',
    title: 'NASA Exoplanets',
    owner: 'NASA',
    topic: 'Classification',
    tags: ['Transit', 'Kepler', 'Disposition', 'Leakage'],
    rows: 9564,
    rowsLabel: '9.6 thousand',
    shape: 'Wide KOI table',
    summary:
      'Kepler and NASA planetary candidates: a dip in a star’s light, and a disposition that says confirmed planet, candidate, or false positive. Famous for a leakage trap, because some flag columns are the label written again.',
    fileNote: 'Disposition columns leak. Drop any column that restates the archive decision.',
    split: {
      marker: 'Held-out stars',
      trainLabel: 'Most stars',
      holdoutLabel: 'Unseen stars',
      trainShare: 75,
      caption: 'Group by host star',
    },
    signal: { interview: 8, research: 9, applied: 6 },
    curiosity: 10,
    sections: {
      models: sec('good', 'Start here', [
        ['Transit logistic', 'Predict confirmed-or-candidate versus false positive from period, depth, duration, and stellar radius. A logistic model with a short feature list. Accuracy is the wrong headline because the classes are uneven.'],
        ['Leakage audit', 'Before fitting, remove koi_disposition, pdisposition, and any score the archive already computed from the same decision. Then fit again and show the collapse in performance.'],
        ['Calibration', 'A threshold for “worth a follow-up telescope night” is a precision-recall choice. Report precision at a fixed review budget.'],
      ]),
      statistics: sec('warn', 'Leakage', [
        ['Archive scores', 'The Kepler pipeline already scored these objects. Using its score to predict its disposition is not a discovery. Treat pipeline outputs as a baseline you must beat with raw transit features, or exclude them.'],
        ['Multiple candidates', 'Several rows can share a host star. A random row split leaks the star. Group the split by star id.'],
      ]),
      interviews: ask('good', 'Screen ready', [
        [
          'Label leakage',
          'The archive disposition is the label. Nearby columns describe how the archive reached that disposition. A model that sees them will post a spectacular score and has learned to read the answer key.',
          'Which columns would you drop before training, and how would you prove they were leaking?',
          'Drop disposition, prior disposition, and archive scores. Fit the same model with and without them. If the score collapses, those columns were the label. The model you discuss is the one that only sees transit geometry and stellar parameters.',
        ],
        [
          'Follow-up budget',
          'Telescope time is the decision. Calling every candidate a planet catches the planets and also floods the queue. Calling almost none of them a planet looks accurate if false positives dominate.',
          'What operating point would you hand a review team?',
          'Precision at the number of candidates they can actually observe. Show the precision-recall curve and pick the point where the queue fills. Do not pick the threshold that maximizes accuracy.',
        ],
        [
          'Shared stars',
          'Two planet candidates around one star share stellar parameters and often share systematic noise. If one row is in train and the other in test, the star has been seen.',
          'How do you split this table?',
          'By host star, so every candidate of a star lives on one side. Report the metric on unseen stars. A random row split is the number you mention only to show how kind it was.',
        ],
      ]),
      research: sec('idle', 'Ideas', [
        ['False-positive modes', 'Separate eclipsing binaries from instrumental noise inside the false-positive class. The useful research is which failure mode the transit shape catches.'],
        ['Threshold drift', 'Ask whether a model trained on earlier Kepler quarters keeps its precision on later quarters.'],
      ]),
      applications: sec('idle', 'In practice', [
        ['Follow-up queue', 'Survey teams rank candidates for radial-velocity time. The product is an ordered list with a precision target, not a yes-or-no stamp.'],
        ['Catalog QA', 'The leakage audit itself is a data-quality check on any future archive extract.'],
      ]),
    },
  },
  {
    ref: 'heesoo37/120-years-of-olympic-history-athletes-and-results',
    title: 'Olympic Athletes',
    owner: 'heesoo37',
    topic: 'Regression',
    tags: ['Medals', 'Sports', 'Nations', 'Body size'],
    rows: 271116,
    rowsLabel: '271 thousand',
    shape: '15 columns',
    summary:
      'Every athlete-event at the modern Games from Athens 1896 through Rio 2016, with age, size, nation, and medal. Medal cells are mostly empty. The honest unit is a country’s results in a sport, not a prediction that this rower will podium.',
    fileNote: 'One row is an athlete in an event. Medal is missing when they did not medal.',
    split: {
      marker: 'Later Games',
      trainLabel: 'Through 2008',
      holdoutLabel: '2012–2016',
      trainShare: 80,
      caption: 'Hold out recent Games',
    },
    signal: { interview: 8, research: 8, applied: 6 },
    curiosity: 9,
    sections: {
      models: sec('good', 'Start here', [
        ['Nation-sport counts', 'Aggregate golds and total medals by nation, sport, and Games. A simple model with nation size proxy and host indicator. Beat “the same nations as last time.”'],
        ['Athlete size', 'Within one sport and sex, describe height and weight. A classifier that “predicts sport from height” is a demo, and it fails as soon as two sports share a body type.'],
        ['Participation', 'Model the number of women entered by Games and sport. That series is the clearest signal in the file.'],
      ]),
      statistics: sec('good', 'Included', [
        ['Empty medals', 'Most rows have no medal. A mean of a medal indicator at athlete level is tiny and unstable. Aggregate first.'],
        ['Host and boycott', 'A host city and a boycott year change who shows up. Any nation effect that ignores those years is partly politics.'],
      ]),
      interviews: ask('good', 'Screen ready', [
        [
          'Unit of analysis',
          'A row is one athlete in one event, and most of them leave without a medal. Fitting “will this person medal” from height, age, and nation treats a rare team outcome as a personal trait.',
          'What unit would you model, and what unit would you refuse?',
          'Model medal counts for a nation in a sport at a Games. Refuse an athlete-level medal classifier built from body size. If you study body size, describe it within one sport and sex, and do not attach a medal claim.',
        ],
        [
          'Changing Games',
          'The program, the number of events, and who was allowed to enter all changed between 1896 and 2016. A pooled regression treats those as one population.',
          'How do you keep era from masquerading as talent?',
          'Hold out entire later Games, include a Games effect, and fit participation separately from medals. A record that only appears because the event list grew is not a performance effect.',
        ],
        [
          'Host bump',
          'Host nations enter more athletes and often win more medals. Leaving the host flag out assigns that bump to the country’s enduring strength.',
          'What would you add before interpreting a country coefficient?',
          'A host indicator, and a check that drops boycott Games. Then say whether the country effect survives. If it shrinks, the original number was partly a home Games.',
        ],
      ]),
      research: sec('idle', 'Ideas', [
        ['Women’s entries', 'The participation series by sport is a clean descriptive paper. Keep the claim on entries, not on “ability.”'],
        ['Body-size drift', 'Within a single event, height and weight trends over decades. Report the trend with the event definition held as fixed as the data allows.'],
      ]),
      applications: sec('idle', 'In practice', [
        ['Federation review', 'National committees already compare medal counts per entered athlete. This table is the public version of that ratio, with the host effect written down.'],
        ['Broadcast context', 'A size distribution for one event is a fair on-air graphic. A medal prediction for a named athlete is not.'],
      ]),
    },
  },
  {
    ref: 'nathanlauga/nba-games',
    title: 'NBA Games',
    owner: 'Nathan Lauga',
    topic: 'Classification',
    tags: ['Home win', 'Rest', 'Form', 'Schedule'],
    rows: 25686,
    rowsLabel: '26 thousand',
    shape: '5 tables',
    summary:
      'NBA games with line scores, standings, and player-game detail. The disciplined question is whether the home side wins, using only what you knew at tip-off.',
    fileNote: 'games.csv is the match table. Player box scores are a second, much taller table.',
    split: {
      marker: 'Later seasons',
      trainLabel: 'Earlier seasons',
      holdoutLabel: 'Latest',
      trainShare: 75,
      caption: 'Split on season',
    },
    signal: { interview: 7, research: 7, applied: 7 },
    curiosity: 9,
    sections: {
      models: sec('good', 'Start here', [
        ['Home baseline', 'The home team wins more often than not. That rate is the baseline accuracy. A model that does not beat it has not found anything.'],
        ['Pre-tip form', 'Add rest days, recent point differential, and standings entering the game. Build those features from past games only. Score log loss, not just accuracy.'],
        ['Player table later', 'Only after the game model is clean, use player-game rows for a usage or plus-minus description. Never join the final box score into the pre-tip model.'],
      ]),
      statistics: sec('good', 'Included', [
        ['Home rate by season', 'The home advantage is not a constant. Plot it by season before you quote a single number.'],
        ['Back-to-backs', 'Rest is uneven. Show win rate by rest days with sample sizes, because some rest bins are rare.'],
      ]),
      interviews: ask('good', 'Screen ready', [
        [
          'Tip-off cutoff',
          'The final score, shooting percentages, and who played are on the same game row as the winner. Using them to “predict” the winner is reading the box score aloud.',
          'Which information is allowed in a pre-game model?',
          'Home identity, rest, and form computed from earlier games only. Drop points, shooting, and line scores from the game you are predicting. If a feature is created by the final buzzer, it is not a feature.',
        ],
        [
          'Baseline',
          'Home teams win a bit over half the time. A 60 percent accurate model sounds useful until you notice a coin that always says home is already close.',
          'What baseline do you report beside the model?',
          'Always-home accuracy and log loss. The model has to beat both. A lift of one point of accuracy with worse probability scores is not a better tip.',
        ],
        [
          'Season drift',
          'Pace, three-point rate, and schedule density changed across the file. A random mix of 2008 and 2019 games lets the model train on the future style of play.',
          'How do you split seasons?',
          'Train on earlier seasons and test on a later one. Refit the home rate inside the training window so the baseline is allowed to move too.',
        ],
      ]),
      research: sec('idle', 'Ideas', [
        ['Rest effect', 'Estimate the back-to-back penalty after opponent quality is included. Publish the interval, which will be narrower than the folklore.'],
        ['Travel', 'If you add arena coordinates, a distance feature is a research extra, and only if it is known before tip.'],
      ]),
      applications: sec('idle', 'In practice', [
        ['Preparation', 'Staff already look at rest and recent margin. A model is useful when it beats the home rate on a future season, in probabilities.'],
        ['Broadcast', 'A pre-game win probability with a stated home baseline is a fair graphic. A number built from the final box score is a recap.'],
      ]),
    },
  },
  {
    ref: 'martj42/international-football-results-from-1872-to-2017',
    title: 'International Football Results',
    owner: 'martj42',
    topic: 'Classification',
    tags: ['Results', 'Friendlies', 'Neutrals', 'Elo'],
    rows: 49393,
    rowsLabel: '49 thousand',
    shape: '9 columns',
    summary:
      'Men’s full internationals since 1872: scores, tournament, city, and whether the ground was neutral. Friendly matches and World Cup matches are not the same experiment.',
    fileNote: 'results.csv is the match file. Goal scorers and shootouts live beside it.',
    split: {
      marker: 'Later years',
      trainLabel: 'Through 2014',
      holdoutLabel: 'Recent',
      trainShare: 78,
      caption: 'Split on match date',
    },
    signal: { interview: 7, research: 7, applied: 7 },
    curiosity: 8,
    sections: {
      models: sec('good', 'Start here', [
        ['Three-way result', 'Predict home win, draw, or away win. The baseline is the frequency of each, which is not uniform. A team-strength model has to beat that frequency on log loss.'],
        ['Strength over time', 'Maintain a rating that updates only from past matches. Neutral grounds should not grant a home bonus. Tournament matches can be weighted above friendlies.'],
        ['Goal margins', 'A second model for goal difference, fit on the same time split. Keep shootouts out of the open-play margin.'],
      ]),
      statistics: sec('good', 'Included', [
        ['Friendly mix', 'A large share of rows are friendlies. Stratify metrics by tournament type or the model will be graded mostly on exhibitions.'],
        ['Team names', 'Countries rename and split. A strength model needs a name map or Germany and its predecessors become different teams by accident.'],
      ]),
      interviews: ask('good', 'Screen ready', [
        [
          'Friendlies',
          'The file mixes World Cup knockouts with low-stakes friendlies. A single accuracy number is dominated by the friendlies, where lineups are experimental and the home side still has a crowd.',
          'How do you stop friendlies from defining the score?',
          'Report log loss separately for competitive tournaments and friendlies, or weight competitive matches higher in the fit. State which number you would take to a review.',
        ],
        [
          'Neutral grounds',
          'The dataset marks matches played at a neutral venue. Treating the listed home team as a true home side hands them a bonus they did not have.',
          'What do you do with the neutral flag?',
          'Turn the home advantage off when the flag is set. Check that World Cup matches in a third country are not coded as home wins for the team written in the home column.',
        ],
        [
          'Updating ratings',
          'A rating that peeks at a tournament’s later matches will look clairvoyant about the final. The rating entering a match may use only earlier dates.',
          'How do you build a team rating without leakage?',
          'Walk the matches in date order and update after the match is played. The test set is a later span of dates. A global rating fit on the whole file is a leak.',
        ],
      ]),
      research: sec('idle', 'Ideas', [
        ['Home edge over time', 'Estimate whether the home advantage in competitive matches has shrunk. Keep friendlies in a separate series.'],
        ['Name continuity', 'Document the country-name map and show how ratings change if successor teams inherit the old rating.'],
      ]),
      applications: sec('idle', 'In practice', [
        ['Preview', 'A rating plus a neutral-ground switch is the preview a desk can explain. The output is a three-way probability.'],
        ['Tournament path', 'Updating only on past dates is also how a fair historical replay of a World Cup is run.'],
      ]),
    },
  },
  {
    ref: 'maxhorowitz/nflplaybyplay2009to2016',
    title: 'NFL Play-by-Play',
    owner: 'Max Horowitz',
    topic: 'Classification',
    tags: ['Down', 'Distance', 'Win probability', 'EPA'],
    rows: 362447,
    rowsLabel: '362 thousand',
    shape: '102 columns',
    summary:
      'Every NFL play across several seasons, with down, distance, field position, and score. The useful question is the decision before the snap. Yards gained on the play is the outcome, not a feature.',
    fileNote: 'Wide play table. Many columns describe the result of the same play.',
    split: {
      marker: 'Later seasons',
      trainLabel: 'Early seasons',
      holdoutLabel: 'Latest',
      trainShare: 72,
      caption: 'Split on season',
    },
    signal: { interview: 8, research: 8, applied: 7 },
    curiosity: 9,
    sections: {
      models: sec('good', 'Start here', [
        ['Expected points', 'From down, distance, yard line, and time, estimate expected points. The baseline is a smoothed historical average in those bins. A model should beat the bin average out of season.'],
        ['Play type', 'Predict pass versus run from the pre-snap state and score differential. Include no air yards, no completion, no tackler.'],
        ['Win probability', 'A separate model from score difference, time remaining, and timeouts. Calibrate it. A sharp but uncalibrated curve is a bad broadcast number.'],
      ]),
      statistics: sec('warn', 'Leakage', [
        ['Result columns', 'Yards gained, interception, and first-down flags are the play’s result. Audit the column list and freeze a pre-snap set before any fit.'],
        ['Rare states', 'Fourth and long with two minutes left is a thin bin. Show sample size beside any expected-points cell.'],
      ]),
      interviews: ask('good', 'Screen ready', [
        [
          'Pre-snap',
          'This file records the call and the result on one row. Air yards, yards after catch, and who made the tackle exist only because the play already happened.',
          'How do you choose features for a decision model?',
          'Write a pre-snap list: down, distance, yard line, score, time, timeouts, and formation if it is known before the snap. Everything created by the play result stays out. Then refit and show the score drop, which is the leakage you removed.',
        ],
        [
          'Bin baseline',
          'Coaches already know that third and short near midfield is different from third and long at their own 10. A gradient-boosted model can rediscover the bin chart and look new.',
          'What baseline would you require?',
          'A historical average of expected points in down-distance-field bins, evaluated on a later season. The model must beat that table on the same split, or you publish the table.',
        ],
        [
          'Thin bins',
          'Some game states almost never occur. A flexible model will invent a confident expected-points value there.',
          'How do you present a rare game state?',
          'Show the count behind the estimate and widen the interval as the count falls. Refuse a point value for a state the training seasons barely saw.',
        ],
      ]),
      research: sec('idle', 'Ideas', [
        ['Fourth-down policy', 'Compare actual fourth-down calls with the expected-points difference between going for it and kicking, on a later season. The paper is the gap, with uncertainty.'],
        ['Era of the pass', 'Pass rate by down and year is a descriptive result worth more than another classifier.'],
      ]),
      applications: sec('good', 'In practice', [
        ['Broadcast win probability', 'Calibrated win probability from score and time is the graphic. It updates after the play, using the new state, not the play’s hidden result columns.'],
        ['Front-office review', 'Expected points over a season is a review tool when the pre-snap definition is fixed before the season.'],
      ]),
    },
  },
  {
    ref: 'hugomathien/soccer',
    title: 'European Soccer Matches',
    owner: 'Hugo Mathien',
    topic: 'Classification',
    tags: ['Odds', 'Leagues', 'Form', 'Baseline'],
    rows: 25979,
    rowsLabel: '26 thousand',
    shape: '7 tables',
    summary:
      'European league matches with team attributes and bookmaker odds in one SQLite database. The odds are the baseline. Beating them on a future season is the whole interview.',
    fileNote: 'Match is the main table. Odds columns are implied probabilities already.',
    split: {
      marker: 'Later seasons',
      trainLabel: 'Earlier seasons',
      holdoutLabel: 'Latest',
      trainShare: 74,
      caption: 'Split on season',
    },
    signal: { interview: 8, research: 7, applied: 8 },
    curiosity: 8,
    sections: {
      models: sec('good', 'Start here', [
        ['Odds baseline', 'Convert the bookmaker odds to a three-way probability and score its log loss. Your model has to beat that number on a later season, not on a shuffled set of matches.'],
        ['Form features', 'Add goals and results from each side’s previous matches only. If you cannot beat the odds, say so and stop.'],
        ['Attributes carefully', 'FIFA-like attribute snapshots are not a pure pre-match feed. Use them only with a date check, or leave them out of the claim.'],
      ]),
      statistics: sec('good', 'Included', [
        ['Implied probability', 'Odds include a margin. Normalize the three prices so they sum to one before you treat them as probabilities.'],
        ['League mix', 'A big league and a small league do not share a draw rate. Stratify the score or pool with a league effect.'],
      ]),
      interviews: ask('good', 'Screen ready', [
        [
          'Closing line',
          'Bookmaker odds are a strong public prediction. A model that ignores them can look clever against a flat baseline and still be worse than the price a person could already read.',
          'What do you compare your model with?',
          'The bookmaker’s normalized three-way probabilities, on a later season, in log loss. If you do not beat that, the result is that the odds won. That is a complete answer.',
        ],
        [
          'Future form',
          'A rolling form feature that includes today’s goals, or the next match, leaks the label. Date handling in SQL is where this dataset usually goes wrong.',
          'How do you build form features?',
          'For each match, aggregate only rows with an earlier date for that team. Assert in a test that the maximum date in the feature is before the match date. Then fit.',
        ],
        [
          'Margin',
          'Raw decimal odds do not sum to a probability of one. Treating them as if they do mis-states the baseline.',
          'How do you turn odds into a baseline probability?',
          'Invert the decimals and divide by the sum across the three outcomes. Score that normalized triple. Mention the overround so the baseline is a probability, not a price.',
        ],
      ]),
      research: sec('idle', 'Ideas', [
        ['Where the odds miss', 'Look for leagues or seasons where a simple form model beats the normalized odds. A small, specific miss is more interesting than a global loss.'],
        ['Draw rate', 'Describe how draw frequency differs by league. That table may explain more than another classifier.'],
      ]),
      applications: sec('warn', 'Odds first', [
        ['Desk check', 'The practical use is a second opinion that is only promoted when it beats the published price out of sample.'],
        ['Story', 'If it does not beat the odds, the published result is the odds themselves, which is still a useful baseline for a product.'],
      ]),
    },
  },
  {
    ref: 'datasnaek/chess',
    title: 'Lichess Chess Games',
    owner: 'Lichess',
    topic: 'Classification',
    tags: ['Ratings', 'Openings', 'Time control', 'Winner'],
    rows: 20058,
    rowsLabel: '20 thousand',
    shape: '16 columns',
    summary:
      'About twenty thousand online chess games with ratings, time control, opening, and the move list. The winner is almost a function of the two ratings. The move list is a leak if you are predicting the result.',
    fileNote: 'Rated and casual games are mixed. The moves column contains the whole game.',
    split: {
      marker: 'Later games',
      trainLabel: 'Earlier',
      holdoutLabel: 'Latest',
      trainShare: 70,
      caption: 'Split on created time',
    },
    signal: { interview: 8, research: 7, applied: 6 },
    curiosity: 9,
    sections: {
      models: sec('good', 'Start here', [
        ['Rating difference', 'Predict white win, draw, or black win from the two ratings and the time control. A multinomial logistic model. The rating gap is the baseline everyone must beat.'],
        ['Opening family', 'Add the ECO family, not the full opening name. Ask whether the opening still matters after the ratings are in the model.'],
        ['Leave the moves out', 'The moves column determines the result. Using it is not a prediction. A separate study can model opening choice from rating, which is a different target.'],
      ]),
      statistics: sec('good', 'Included', [
        ['Draws and upsets', 'Draws climb as ratings climb and as the gap shrinks. Plot result shares against rating difference before fitting.'],
        ['Time control', 'Bullet and classical games do not share an upset rate. Stratify or include the increment code.'],
      ]),
      interviews: ask('good', 'Screen ready', [
        [
          'Rating baseline',
          'A 1900 player against a 1400 player wins most of the time on this site. A model stuffed with opening names can look strong while mostly rediscovering who was higher rated.',
          'What baseline do you fit first, and what would count as a real lift?',
          'Multinomial logistic regression on the rating difference and the time control. An opening feature has to improve log loss on later games after that baseline. If it does not, the opening is color, not signal.',
        ],
        [
          'Move list',
          'The moves column is the game. The result is a function of those moves. Including even a “number of moves until mate” style parse uses the outcome.',
          'What do you do with the moves column in a result model?',
          'Drop it. You may use the opening’s ECO code, which is chosen at the start, and you should say you stopped at a fixed ply. The rest of the move list belongs to a different question.',
        ],
        [
          'Casual games',
          'Unrated games have ratings that were not at stake, and the players may be experimenting. Pooling them with rated games softens the rating effect and confuses the label.',
          'Which games belong in the model?',
          'Fit the headline model on rated games. If you keep casual games, report a separate score. Do not let them silently dilute the rating baseline.',
        ],
      ]),
      research: sec('idle', 'Ideas', [
        ['Opening after rating', 'Estimate the residual effect of a few ECO families at a fixed rating gap. Most families will be indistinguishable from noise.'],
        ['Time control', 'Compare upset rates in bullet and rapid at the same rating gap. That contrast is a clean short paper.'],
      ]),
      applications: sec('idle', 'In practice', [
        ['Matchmaking check', 'A rating-difference curve is how a site checks that its ratings still predict results. Openings are not required for that check.'],
        ['Opening stats', 'Opening frequencies by rating band are a product surface of their own, with no winner model attached.'],
      ]),
    },
  },
  {
    ref: 'stefanoleone992/fifa-21-complete-player-dataset',
    title: 'FIFA 21 Players',
    owner: 'Stefano Leone',
    topic: 'Regression',
    tags: ['Attributes', 'Wage', 'Age', 'Circular'],
    rows: 18944,
    rowsLabel: '19 thousand',
    shape: '100+ columns',
    summary:
      'FIFA 21 player cards: overall, potential, wage, value, age, and the familiar attribute blocks. Overall is partly a formula of those attributes, so predicting it is the wrong trophy. Wage and value are the interesting targets.',
    fileNote: 'SoFIFA extract. Overall is derived from the attributes on the same card.',
    split: {
      marker: 'By position',
      trainLabel: 'Most players',
      holdoutLabel: 'Held-out players',
      trainShare: 75,
      caption: 'Player-level split',
    },
    signal: { interview: 8, research: 6, applied: 6 },
    curiosity: 8,
    sections: {
      models: sec('good', 'Start here', [
        ['Wage from age and role', 'Predict log wage from age, position group, and overall. Then remove overall and use the attribute blocks. The comparison shows how much of wage is just the card’s headline number.'],
        ['Value versus wage', 'Fit log value with the same features. The two targets disagree for young players. That disagreement is the result.'],
        ['Do not fit overall', 'A model of overall from pace, shooting, and passing will look perfect and has recovered the game’s formula. Mention it only as a negative control.'],
      ]),
      statistics: sec('warn', 'Circular', [
        ['Formula check', 'Regress overall on the six composite attributes. If R² is near one, you have proved the column is derived. Stop and change the target.'],
        ['Position mix', 'A goalkeeper and a winger do not share an attribute scale. Stratify by position group before you quote a wage coefficient.'],
      ]),
      interviews: ask('good', 'Screen ready', [
        [
          'Derived overall',
          'The overall rating on a FIFA card is computed from the attribute scores sitting beside it. A regression that predicts overall from those scores posts a beautiful error and has learned a formula, not a market.',
          'How would you show that trap, and what would you predict instead?',
          'Fit overall from the composite attributes and show the near-perfect fit as a negative control. Then model log wage or log value from age, position, and attributes, and report that error. The second number is the one you discuss.',
        ],
        [
          'Young players',
          'Potential and age pull value up for players who have not been paid like veterans. A single wage model without age will call every prospect underpaid or every veteran overpaid.',
          'How should age enter a value model?',
          'Include age and an age-squared term, or fit separate curves for wage and value. Show the residual by age band. The story is the gap between value and wage for young players, not a single R².',
        ],
        [
          'Goalkeepers',
          'Goalkeeper attributes live on different columns. A pooled model imputes shooting for keepers and invents a relationship.',
          'How do you treat position?',
          'Split goalkeepers from outfield players before any attribute model. Within outfield players, control for position group. A coefficient that only appears in the pooled fit is not a finding.',
        ],
      ]),
      research: sec('idle', 'Ideas', [
        ['Potential gap', 'Describe value against the gap between potential and overall, within age bands. Keep the claim inside the game’s economy.'],
        ['League effects', 'Wage levels differ by league. A league indicator may dominate skill. Say so if it does.'],
      ]),
      applications: sec('idle', 'In practice', [
        ['Scouting toy', 'This is a game database. A wage model explains the card market. It is not a quote for a real transfer.'],
        ['Data audit', 'The overall-from-attributes regression is a teaching audit for derived labels in any product table.'],
      ]),
    },
  },
  {
    ref: 'bobbyscience/league-of-legends-diamond-ranked-games-10-min',
    title: 'League of Legends, 10 Minutes',
    owner: 'bobbyscience',
    topic: 'Classification',
    tags: ['Blue side', 'Gold', 'Dragons', 'Early game'],
    rows: 9879,
    rowsLabel: '9.9 thousand',
    shape: '40 columns',
    summary:
      'About ten thousand Diamond ranked games, snapshotted at ten minutes, with a blue-side win label. Gold and dragons at that minute are strong. Blue side itself is a structural edge, and some columns are perfect mirrors of each other.',
    fileNote: 'One row per game. Red-side stats often duplicate blue-side stats with a sign flip.',
    split: {
      marker: 'Held-out games',
      trainLabel: 'Most games',
      holdoutLabel: 'Unseen games',
      trainShare: 75,
      caption: 'Game-level split',
    },
    signal: { interview: 8, research: 7, applied: 6 },
    curiosity: 9,
    sections: {
      models: sec('good', 'Start here', [
        ['Gold difference', 'Predict the blue-side win from blue gold minus red gold at ten minutes. That one feature is the baseline. Extra features have to beat it on log loss.'],
        ['Dragons and kills', 'Add dragon difference and kill difference. Check correlations first so you do not present three copies of the same lead.'],
        ['Side baseline', 'A model that ignores side should be compared with the raw blue-win rate. If your accuracy equals that rate, you have fit the map, not the match.'],
      ]),
      statistics: sec('warn', 'Duplicates', [
        ['Mirror columns', 'Many red columns are the negative of the blue difference. Fitting both double-counts one fact and inflates a linear model’s confidence.'],
        ['Diamond only', 'These are high-rank games. A coefficient is not a law of the whole player base. Say the rank in the first sentence.'],
      ]),
      interviews: ask('good', 'Screen ready', [
        [
          'One gold feature',
          'At ten minutes the team with more gold usually wins, and the file stores that fact several times: blue gold, red gold, and the difference. A model with all three looks richer than a model with one number.',
          'Which single feature is the baseline, and how do you treat the mirrors?',
          'Use the gold difference alone as the baseline. Drop columns that are linear copies of features you already kept. Any added feature has to improve log loss on held-out games after that baseline.',
        ],
        [
          'Blue side',
          'Blue side wins more often than half the time in this extract because of map side, not because those players are better. A model can smuggle that base rate into every prediction.',
          'How do you report side so it is not mistaken for skill?',
          'Publish the blue win rate first. Fit the model on top of a side indicator, or evaluate within side. The claim you want is whether a gold lead still matters after side is accounted for. It does. The side rate is not a skill finding.',
        ],
        [
          'Rank scope',
          'Diamond games are a selected ladder. Early-game gold may matter differently in a casual queue, and this file cannot show that.',
          'What population does the result cover?',
          'Diamond ranked games at the ten-minute mark, in the patch window of the extract. You would not ship the threshold to another queue without a new labeled sample from that queue.',
        ],
      ]),
      research: sec('idle', 'Ideas', [
        ['Dragon after gold', 'Estimate the extra win probability of a dragon lead at a fixed gold difference. The interval is the result.'],
        ['Patch window', 'If the file has no patch id, say that balance changes are invisible. That caveat belongs in the abstract.'],
      ]),
      applications: sec('idle', 'In practice', [
        ['Broadcast odds', 'A ten-minute win probability from gold difference and side is explainable. A forty-column model is not a better graphic.'],
        ['Review', 'Coaches already talk in gold and dragons. The model is a calibrated version of that sentence, limited to this rank.'],
      ]),
    },
  },
  {
    ref: 'christianlillelund/csgo-round-winner-classification',
    title: 'CS:GO Round Winners',
    owner: 'christianlillelund',
    topic: 'Classification',
    tags: ['Rounds', 'Economy', 'Side', 'Bomb'],
    rows: 122410,
    rowsLabel: '122 thousand',
    shape: '97 columns',
    summary:
      'Professional Counter-Strike rounds with equipment value, side, and bomb status, labeled by which side won the round. Economy is the signal. Later rounds in the same match are not independent.',
    fileNote: 'One row per round. Rounds share a match, a map, and a half.',
    split: {
      marker: 'Held-out matches',
      trainLabel: 'Most matches',
      holdoutLabel: 'Unseen matches',
      trainShare: 75,
      caption: 'Split on match',
    },
    signal: { interview: 7, research: 7, applied: 6 },
    curiosity: 8,
    sections: {
      models: sec('good', 'Start here', [
        ['Equipment baseline', 'Predict the round winner from the equipment-value gap and the side. Logistic regression. This is the economy story commentators already tell.'],
        ['Bomb and time', 'Add whether the bomb is planted and a coarse time bucket, but only if those fields are known at the decision point you claim. Say what that moment is.'],
        ['Match groups', 'Evaluate on held-out matches. A random round split lets both teams’ habits leak across the cut.'],
      ]),
      statistics: sec('good', 'Included', [
        ['Pistol rounds', 'The first round of a half has a fixed buy. Mixing it with full-buy rounds blurs the equipment coefficient. Report it separately.'],
        ['Side imbalance', 'T and CT are not symmetric on every map. Include map and side, or the equipment effect is partly a map effect.'],
      ]),
      interviews: ask('good', 'Screen ready', [
        [
          'Economy baseline',
          'A side with rifles against a side with pistols wins the round most of the time. A wide feature set can rediscover equipment value under another name.',
          'What is the baseline, and when is an extra feature allowed?',
          'Equipment-value difference plus side, scored on matches not seen in training. An extra feature stays only if log loss improves on that split. Otherwise you report the economy model.',
        ],
        [
          'Shared match',
          'Thirty rounds from one match share two teams, one map, and momentum. If fifteen of them are in the test set, you have not tested a new match.',
          'How do you split rounds?',
          'By match id, so every round of a match is on one side. Quote the metric on unseen matches. A round-level random split is the optimistic number you show as a warning.',
        ],
        [
          'Decision time',
          'Bomb-planted and players-alive change as the round unfolds. A model that uses the final state of the round is a recap.',
          'What moment does your model describe?',
          'Name it. A buy-time model may use money and side only. A mid-round model may use bomb status if you can say it was known then. Features that only exist after the round ends stay out.',
        ],
      ]),
      research: sec('idle', 'Ideas', [
        ['Map interaction', 'Does the equipment gap matter more on some maps? Fit one interaction and correct for the number of maps you tried.'],
        ['Force buys', 'Describe win rate for a force buy against a full buy, by map. The table may be enough.'],
      ]),
      applications: sec('idle', 'In practice', [
        ['Broadcast', 'A round win probability from equipment and side is a graphic a viewer can check against the buy menu.'],
        ['Review', 'Teams already chart economy. The model is that chart, calibrated, with pistol rounds pulled out.'],
      ]),
    },
  },
  {
    ref: 'NUFORC/ufo-sightings',
    title: 'UFO Sightings',
    owner: 'NUFORC',
    topic: 'Time series',
    tags: ['Reports', 'Shapes', 'Duration', 'Reporting'],
    rows: 80332,
    rowsLabel: '80 thousand',
    shape: '11 columns',
    summary:
      'Decades of public UFO reports: when, where, what shape, and how long it lasted. The series tracks reporting, the internet, and population much more than it tracks objects. That is the result to defend.',
    fileNote: 'scrubbed.csv is the analysis file. Duration and shape are messy text.',
    split: {
      marker: 'Later years',
      trainLabel: 'Earlier years',
      holdoutLabel: 'Recent',
      trainShare: 70,
      caption: 'Forecast report counts',
    },
    signal: { interview: 8, research: 7, applied: 4 },
    curiosity: 9,
    sections: {
      models: sec('good', 'Start here', [
        ['Monthly counts', 'Model the count of reports per month. A trend plus a smooth level shift around widespread internet access will beat a fancy per-row classifier.'],
        ['Shape text', 'Treat shape as a cleaned categorical for a composition chart over decades. Predicting shape from the comment text is a text demo, and it is not evidence about the sky.'],
        ['Duration parse', 'Parse duration into seconds with an explicit failure bucket. Do not average the raw strings.'],
      ]),
      statistics: sec('warn', 'Reporting', [
        ['Population and web', 'Report rates rise where people and web forms are. Compare counts with a population proxy before you narrate a wave of events.'],
        ['Duration junk', 'A few parsed durations are centuries long because the text said so. Winsorize or drop impossible values and show how many you touched.'],
      ]),
      interviews: ask('good', 'Screen ready', [
        [
          'What a row is',
          'A row is a person submitting a report to a public center. It is not a confirmed object, and it is not a random sample of the sky. Counts jump when reporting gets easier.',
          'What claim is this table allowed to support?',
          'Claims about reporting: volume over time, where reports come from, and how shape labels changed. Refuse a claim that a model detected craft. The forecast you can defend is next month’s report count, with a wide interval.',
        ],
        [
          'Internet shift',
          'A smooth exponential fit through the whole century misses the level change when online reporting arrived. The residual becomes a fake wave.',
          'How would you model the count series?',
          'Monthly counts with a trend and a level shift at a prechosen reporting-era date, plus a seasonal term. Plot the raw series beside the fit. If the shift date is tuned to maximize drama, say that it was tuned.',
        ],
        [
          'Duration text',
          'Duration is a sentence. A few rows claim a duration longer than a human lifetime. A mean of the parsed numbers is those rows.',
          'How do you summarize duration?',
          'Parse to seconds, count the parse failures, and report a median after capping impossible values. Show the cap. Do not publish a mean of the raw parse.',
        ],
      ]),
      research: sec('idle', 'Ideas', [
        ['Shape vocabulary', 'The rise and fall of shape words is a language-of-reporting paper. Keep the claim on labels people chose.'],
        ['Per-capita counts', 'Divide state counts by population for a recent window. The ranking will move. That movement is the point.'],
      ]),
      applications: sec('idle', 'In practice', [
        ['Editorial chart', 'A monthly count with a reporting-era annotation is an honest public chart.'],
        ['Data cleaning example', 'The duration parse is a useful test of how a team handles impossible values.'],
      ]),
    },
  },
  {
    ref: 'usgs/earthquake-database',
    title: 'Significant Earthquakes',
    owner: 'USGS',
    topic: 'Time series',
    tags: ['Magnitude', 'Depth', 'Region', 'Catalog'],
    rows: 23412,
    rowsLabel: '23 thousand',
    shape: '21 columns',
    summary:
      'Significant earthquakes from the USGS catalog, with magnitude, depth, and place. This is a catalog of recorded events above a threshold, not a machine for calling the next large quake.',
    fileNote: '1965–2016 extract. Magnitude types differ. The catalog threshold matters.',
    split: {
      marker: 'Later years',
      trainLabel: 'Earlier years',
      holdoutLabel: 'Latest',
      trainShare: 75,
      caption: 'Split on time',
    },
    signal: { interview: 8, research: 8, applied: 5 },
    curiosity: 8,
    sections: {
      models: sec('good', 'Start here', [
        ['Regional rates', 'Model annual counts in a few well-defined regions. A Poisson or negative binomial with a very slow trend. The baseline is the historical mean rate.'],
        ['Depth and magnitude', 'Describe depth against magnitude. A regression of magnitude on depth is a weak scientific claim; show the scatter first and keep the model modest.'],
        ['No next-quake model', 'Do not frame a classifier as predicting the next magnitude-7 event from the previous row. State that limit in the notebook’s first cell.'],
      ]),
      statistics: sec('warn', 'Catalog', [
        ['Detection threshold', '“Significant” is a rule. Smaller events are missing by design. A trend in counts can be a network improvement. Read the threshold before the trend.'],
        ['Magnitude types', 'Different magnitude scales appear in one column family. Do not average incompatible types without a conversion note.'],
      ]),
      interviews: ask('good', 'Screen ready', [
        [
          'Catalog, not a siren',
          'The file lists events that passed a significance rule. Networks got better over the same decades. A rising count can be better detection, and a model of “the next big one” from the previous row is not a serious use of this extract.',
          'What will you model, and what will you decline?',
          'Annual counts by region against the historical mean, and a description of depth and magnitude with the catalog rule stated. Decline an operational prediction of the next large event. If asked for a number, give a long-run rate and an interval, not a date.',
        ],
        [
          'Threshold',
          'Events below the cutoff never appear. Fitting a distribution as if the catalog were complete below magnitude 6 misreads the file.',
          'How do you respect the cutoff?',
          'State the significance rule in the methods. Fit rates only inside the population the rule keeps. If you discuss magnitudes, mark the floor under which the extract is silent.',
        ],
        [
          'Region definitions',
          'Place names are strings. A trend for “the Pacific” depends on which box you drew. Changing the box changes the rate.',
          'How do you define a region before you quote a rate?',
          'Fix boxes or use the catalog’s region field, and stick to it. Report the count in each box. A region chosen after seeing a spike is a hypothesis for next time, not a result.',
        ],
      ]),
      research: sec('idle', 'Ideas', [
        ['Depth profiles', 'Compare depth distributions across two predefined regions. The figure is the result if the catalogs are comparable.'],
        ['Detection era', 'Split the time series at a prechosen network-upgrade era and see whether the rate change is concentrated in smaller magnitudes.'],
      ]),
      applications: sec('idle', 'In practice', [
        ['Hazard context', 'Long-run regional rates are an input to hazard conversations. They are not an alert.'],
        ['Teaching catalog bias', 'The threshold discussion is the transferable lesson for any sensor catalog.'],
      ]),
    },
  },
  {
    ref: 'mrpantherson/board-game-data',
    title: 'BoardGameGeek Games',
    owner: 'mrpantherson',
    topic: 'Regression',
    tags: ['Ratings', 'Complexity', 'Shrinkage', 'Mechanics'],
    rows: 20000,
    rowsLabel: '20 thousand',
    shape: '20 columns',
    summary:
      'A BoardGameGeek extract: year, playing time, complexity, mechanics, and ratings. The average of five perfect scores is not a better game than a 7.4 from five thousand plays. Shrinkage is the whole point.',
    fileNote: 'Later scrapes add games. User ratings and the site’s own Geek Rating answer different questions.',
    split: {
      marker: 'Later years',
      trainLabel: 'Older games',
      holdoutLabel: 'Newer',
      trainShare: 70,
      caption: 'Split on year published',
    },
    signal: { interview: 7, research: 6, applied: 6 },
    curiosity: 8,
    sections: {
      models: sec('good', 'Start here', [
        ['Shrink the mean', 'Predict the site’s Bayesian rating, or build your own shrinkage of the raw average toward the global mean by rating count. Raw average is the wrong target.'],
        ['Complexity and time', 'Add weight, playing time, player count, and year. Ask whether complexity still moves the rating after the number of ratings is handled.'],
        ['Mechanics', 'A few common mechanics as indicators. Rare mechanics need a minimum count or they overfit one cult game.'],
      ]),
      statistics: sec('good', 'Included', [
        ['Rating count', 'Plot average rating against log number of ratings. The funnel shape is the lesson. Five-vote games occupy the extremes.'],
        ['Year confounding', 'Newer games have fewer ratings and a different complexity mix. A year split keeps that honest.'],
      ]),
      interviews: ask('good', 'Screen ready', [
        [
          'Five votes',
          'A new game with five ratings of 10 sits at the top of a raw sort. A classic with thousands of ratings sits near 7. Sorting by the raw mean recommends the noisiest games.',
          'How do you rank games so a handful of ratings cannot win?',
          'Shrink the mean toward the global average by the number of ratings, or use the site’s Geek Rating and say you understand it is already shrunk. Show the top of the list before and after. The five-vote game should leave the top.',
        ],
        [
          'Complexity',
          'Heavier games attract a different rater. A positive coefficient on complexity may be the audience, not a reason to add rules.',
          'What would you control for before talking about complexity?',
          'Rating count, year, and playing time. Then show the complexity coefficient. If it shrinks away, the raw association was who shows up to rate, and you say that.',
        ],
        [
          'New releases',
          'A model trained on older games and tested on this year’s releases is the real product question. A random split lets the same hype cycle into both sides.',
          'How do you test a recommender for new games?',
          'Hold out later publication years. Expect a weaker score, and report it. A random-split score is the lab number, not the number for a “new releases” shelf.',
        ],
      ]),
      research: sec('idle', 'Ideas', [
        ['Mechanic co-occurrence', 'Describe which mechanics travel together. A clustering here is a map of the hobby, not a quality score.'],
        ['Playing time', 'Ratings against logged playing time, after shrinkage. The shape is more interesting than a leaderboard.'],
      ]),
      applications: sec('good', 'In practice', [
        ['Shelf sort', 'A store or an app should sort by a shrunk rating. The raw mean is a debug column.'],
        ['New game page', 'Show the rating count beside the score so a perfect new game is visibly thin.'],
      ]),
    },
  },
  {
    ref: 'yamaerenay/spotify-dataset-19212020-160k-tracks',
    title: 'Spotify Tracks',
    owner: 'Yamac Eren Ay',
    topic: 'Clustering',
    tags: ['Audio features', 'Popularity', 'Genres', 'Era'],
    rows: 160000,
    rowsLabel: '160 thousand',
    shape: '19 columns',
    summary:
      'A large extract of Spotify tracks with audio features and popularity, reaching back across decades. Clustering on danceability and energy often redraws those axes and calls them genres. Popularity is not the same thing as the audio.',
    fileNote: 'Features are Spotify’s own scores, already scaled. Popularity is a platform number.',
    split: {
      marker: 'Later years',
      trainLabel: 'Older tracks',
      holdoutLabel: 'Recent',
      trainShare: 72,
      caption: 'Split on release year',
    },
    signal: { interview: 7, research: 7, applied: 6 },
    curiosity: 8,
    sections: {
      models: sec('good', 'Start here', [
        ['Feature clusters', 'Cluster on a few audio features after scaling. Name each cluster from its centers, not from a genre word you hoped to see. Compare with a two-axis plot of energy and valence so you know if the algorithm found more than the plot.'],
        ['Popularity model', 'Predict popularity from audio features and year. Year will dominate. Report the model with and without year.'],
        ['Genre check', 'If genre labels exist, use them as an external check on clusters. Do not treat a cluster id as a genre you discovered.'],
      ]),
      statistics: sec('good', 'Included', [
        ['Year confounding', 'Loudness, danceability, and popularity all drift by decade. A cluster fit on the pooled set can be an era detector.'],
        ['Popularity scale', 'Popularity is a bounded platform score, heavy at the bottom. A mean is a poor summary. Show the distribution.'],
      ]),
      interviews: ask('good', 'Screen ready', [
        [
          'Clusters and axes',
          'Danceability, energy, and valence are already the axes listeners can see. K-means on those columns will return groups that are high-energy and low-energy, then a write-up will name them “party” and “sad.”',
          'How do you tell a real cluster from a redraw of the axes?',
          'Plot the two main features first. Fit the clustering and overlay it. If the groups are stripes along those axes, say the segmentation is the axes. Only claim an extra structure when a group splits a region the scatterplot does not already cut.',
        ],
        [
          'Era',
          'A track from 1965 and a track from 2019 differ in loudness and in how popularity is measured. Pooling them makes year the hidden feature.',
          'How do you keep era from defining the clusters?',
          'Either cluster within a decade or include year and then show clusters with year held aside. Report popularity models with and without year. The version without year is the audio claim.',
        ],
        [
          'Popularity',
          'A high audio-energy score is not a popular song. Platform popularity depends on playlists, catalog, and time. Treating it as intrinsic quality overclaims the columns.',
          'What is popularity allowed to mean here?',
          'A platform score at the time of the extract. Model it as such. Refuse a sentence that says the audio features measure how good a song is.',
        ],
      ]),
      research: sec('idle', 'Ideas', [
        ['Loudness over decades', 'The loudness trend is a descriptive paper of its own, with the extract’s coverage stated.'],
        ['Within-genre spread', 'If labels exist, the within-genre variance of energy may exceed the between-genre gap. That is a useful negative result.'],
      ]),
      applications: sec('idle', 'In practice', [
        ['Playlist brief', 'A product can filter on energy and valence directly. A cluster id is optional once the axes are clear.'],
        ['Catalog stats', 'Popularity against year is a catalog chart. It does not need a cluster model.'],
      ]),
    },
  },
  {
    ref: 'CooperUnion/anime-recommendations-database',
    title: 'Anime Recommendations',
    owner: 'Cooper Union',
    topic: 'Recommendation',
    tags: ['Implicit', 'Popularity', 'Cold start', 'Rank'],
    rows: 7813737,
    rowsLabel: '7.8 million',
    shape: '2 tables',
    summary:
      'Millions of user ratings of anime titles, plus a title table with genre tags. The first recommender anyone should beat is “the shows everyone has already rated highly.”',
    fileNote: 'rating.csv is the large file. A rating of -1 means the user watched and did not score it.',
    split: {
      marker: 'Later activity',
      trainLabel: 'Earlier ratings',
      holdoutLabel: 'Latest',
      trainShare: 70,
      caption: 'Split on time if present, else by user',
    },
    signal: { interview: 7, research: 7, applied: 8 },
    curiosity: 8,
    sections: {
      models: sec('good', 'Start here', [
        ['Popularity baseline', 'Recommend the titles with the highest shrunk mean rating and the most ratings. Report recall at 10 against that list.'],
        ['Latent factors', 'A small matrix factorization on explicit scores, with -1 rows handled as watched-but-unrated, not as a hatred score. Compare recall, not just RMSE.'],
        ['Genre cold start', 'For a title with no ratings, fall back to genre neighbors from the anime table. Measure that case separately.'],
      ]),
      statistics: sec('good', 'Included', [
        ['The -1 code', 'Minus one is a sentinel for “watched, no score.” Leaving it in as a numeric rating destroys the mean. Recode it before any average.'],
        ['Head titles', 'A few shows dominate the rating count. Publish coverage: what share of recommendations collapse onto the head.'],
      ]),
      interviews: ask('good', 'Screen ready', [
        [
          'Sentinel rating',
          'The value -1 does not mean the viewer hated the show. It means they watched and left no score. An average that treats -1 as a number ranks popular unfinished scores at the bottom.',
          'What do you do with -1 before any model?',
          'Split the file into explicit scores and a watched flag. Compute means on the explicit scores only. If you use the flag, it is an implicit signal, not a one-star review.',
        ],
        [
          'Popularity',
          'A latent-factor model often rediscovers the most-rated shows. RMSE can improve while the top 10 you would actually display is the same list a count would have produced.',
          'What baseline and what metric match the product?',
          'A shrunk popularity ranking, compared on recall at 10 and on coverage. RMSE on the stars is secondary. If the lists match popularity, ship the simpler ranker and say so.',
        ],
        [
          'New title',
          'A show with no ratings has no user vector to stand on. Factor models go quiet exactly when a catalog page is new.',
          'What do you show for a title with no ratings?',
          'Genre neighbors from the anime table, or global popularity within that genre. Report that cold-start slice separately so the warm-start recall does not hide it.',
        ],
      ]),
      research: sec('idle', 'Ideas', [
        ['Coverage', 'Measure how concentrated the top of the list is across users. A less accurate model that spreads exposure can be the more interesting result.'],
        ['Implicit versus explicit', 'Compare a model on the watched flag with a model on the stars for the same users.'],
      ]),
      applications: sec('good', 'In practice', [
        ['Home row', 'The popularity baseline is what a home row should beat before a heavier ranker ships.'],
        ['New season', 'Genre fallback is the practical answer for a premiere week.'],
      ]),
    },
  },
  {
    ref: 'nikdavis/steam-store-games',
    title: 'Steam Store Games',
    owner: 'Nik Davis',
    topic: 'Regression',
    tags: ['Reviews', 'Price', 'Owners', 'Genres'],
    rows: 27075,
    rowsLabel: '27 thousand',
    shape: '18 columns',
    summary:
      'Steam store pages: price, genres, languages, and review counts. Owner counts arrive as buckets. The review rate is a fraction with a denominator, and a game with two reviews is not a 100 percent hit.',
    fileNote: 'Owners are ranges, not exact counts. Review totals can be tiny.',
    split: {
      marker: 'Later releases',
      trainLabel: 'Older',
      holdoutLabel: 'Newer',
      trainShare: 70,
      caption: 'Split on release year',
    },
    signal: { interview: 7, research: 6, applied: 7 },
    curiosity: 8,
    sections: {
      models: sec('good', 'Start here', [
        ['Review rate', 'Model the share of positive reviews with a minimum review count, or use a binomial-style weighting. Features: price, genre indicators, years since release. A game under the count floor is excluded from the score and reported as “too new to call.”'],
        ['Owner bucket', 'Predict the owner-range class from the same features. This is ordinal. Do not pretend the bucket midpoint is an exact sales figure.'],
        ['English and tags', 'Language count and a few genres are enough. Hundreds of tag dummies will fit one niche title each.'],
      ]),
      statistics: sec('good', 'Included', [
        ['Denominator', 'Two positive reviews out of two is not the same as ten thousand out of twelve thousand. Show the rate against log review count; the funnel is the chart.'],
        ['Free games', 'A price of zero is a different product. Fit free and paid separately or with an explicit free indicator.'],
      ]),
      interviews: ask('good', 'Screen ready', [
        [
          'Tiny denominators',
          'A new release with two reviews, both positive, has a perfect rate and almost no evidence. Sorting the store by that rate promotes the noisiest pages.',
          'How do you model the review rate so two reviews cannot win?',
          'Weight by review count or shrink the rate toward the global mean, and drop games under a prechosen count from any ranking. Publish the floor. The chart of rate against log count should make the floor obvious.',
        ],
        [
          'Owner buckets',
          'The owners field is a range such as 100,000 to 200,000. Replacing it with the midpoint and running an ordinary regression pretends you observed exact sales.',
          'How do you treat owner ranges?',
          'As an ordinal class. Predict the bucket, or model the chance of clearing a stated threshold. If you show a midpoint, label it as a midpoint and do not quote it as units sold.',
        ],
        [
          'Free and tags',
          'Free games and a long tail of user tags change the price coefficient and create rare dummy variables that memorise one title.',
          'What do you do with price and tags?',
          'An explicit free indicator, and a short list of common genres with everything else in “other.” Rare tags can be a descriptive table. They do not all get a coefficient.',
        ],
      ]),
      research: sec('idle', 'Ideas', [
        ['Price and score', 'After shrinkage and the free flag, does price still move the review rate? A null result is worth reporting.'],
        ['Language count', 'Describe review rate against the number of supported languages within a genre. Keep the claim descriptive.'],
      ]),
      applications: sec('good', 'In practice', [
        ['Store ranking', 'A shrunk review rate with a visible count is a fair sort. The raw percent is not.'],
        ['Catalog health', 'The share of games under the review floor is a catalog statistic of its own.'],
      ]),
    },
  },
  {
    ref: 'annavictoria/speed-dating-experiment',
    title: 'Speed Dating Experiment',
    owner: 'Columbia University',
    topic: 'Classification',
    tags: ['Match', 'Waves', 'Preferences', 'Decision'],
    rows: 8378,
    rowsLabel: '8.4 thousand',
    shape: '195 columns',
    summary:
      'The Columbia speed-dating study: each row is one person rating one partner in a wave, and a match is a mutual yes. The careful question is what a short form can predict. It is not a product for ranking people.',
    fileNote: 'Wide attribute table. Waves are the independent unit. A match requires both yes decisions.',
    split: {
      marker: 'Held-out waves',
      trainLabel: 'Most waves',
      holdoutLabel: 'Unseen waves',
      trainShare: 75,
      caption: 'Split on wave',
    },
    signal: { interview: 8, research: 7, applied: 4 },
    curiosity: 8,
    sections: {
      models: sec('warn', 'Study, not a product', [
        ['Mutual match', 'Predict the match indicator from both people’s stated yes, as a sanity check that reconstructs the definition, then remove the decisions and try only pre-date attributes. The collapse in score is the finding.'],
        ['One-sided yes', 'A second model for one person’s yes from their own stated preferences and the partner’s attributes. Compare with a baseline that uses only the partner’s attractiveness rating, and discuss how circular that rating is.'],
        ['Wave split', 'Hold out entire waves. People in the same event are not a random test set.'],
      ]),
      statistics: sec('warn', 'Definition', [
        ['Match definition', 'A match is both sides saying yes. Modeling it from the two decisions is an identity. Write the identity down so nobody presents it as a result.'],
        ['Class balance', 'Most pairs are not matches. Accuracy will look kind if you predict no. Use log loss or precision on the yes pairs.'],
      ]),
      interviews: ask('good', 'Screen ready', [
        [
          'Mutual yes',
          'The match column is the logical and of two decisions that are also columns. A model allowed to see both decisions recovers the label exactly and has learned nothing about people.',
          'How do you use the decision columns?',
          'Once, as a check that your match definition matches the file. Then drop both decisions and fit only information that existed before the yes or no. Report how far the score falls. That fall is the result.',
        ],
        [
          'Wave structure',
          'Everyone at one event shares a room, a pool of partners, and a night. Splitting rows at random puts both members of a pair, and their friends in the room, on both sides of the cut.',
          'What is the split unit?',
          'The wave. Entire events are held out. Metrics are computed on people and pairs the model has not sat with. A row-wise split is only a debugging convenience.',
        ],
        [
          'What you would ship',
          'Even a real association in a 2000s campus experiment is not a reason to rank human beings in a product. The table is a study of a short meeting.',
          'What decision is this model allowed to inform?',
          'A research claim about which pre-meeting answers relate to a yes, with the wave holdout and the leakage check. It does not inform a ranking product, a price, or an automated accept. If the use case is shipping a ranker, decline it.',
        ],
      ]),
      research: sec('idle', 'Ideas', [
        ['Stated versus revealed', 'Compare the preferences people say they want with the attributes of the partners they actually accepted. The gap is the classic result in this file, and it needs the leakage story kept clean.'],
        ['Wave heterogeneity', 'A preference that appears in one wave and vanishes in the holdout waves is not a trait. Report that instability if you find it.'],
      ]),
      applications: sec('warn', 'Research only', [
        ['Methods example', 'The file is a strong example of an identity label, a grouped split, and a metric that accuracy will flatter.'],
        ['Product boundary', 'The applied lesson is the boundary: a mutual-decision label is a study outcome, not a score to attach to a person in a live system.'],
      ]),
    },
  },
  {
    ref: 'tunguz/200000-jeopardy-questions',
    title: 'Jeopardy Questions',
    owner: 'Bojan Tunguz',
    topic: 'Text',
    tags: ['Clues', 'Categories', 'Answers', 'Retrieval'],
    rows: 216930,
    rowsLabel: '217 thousand',
    shape: '7 columns',
    summary:
      'Around two hundred thousand Jeopardy clues with category, value, and answer. The serious task is retrieval of the answer from the clue, or classification of the category. Value is a difficulty hint from the show, not a measure of truth.',
    fileNote: 'Clues are short. Some answers repeat across years. Categories are messy strings.',
    split: {
      marker: 'Later air dates',
      trainLabel: 'Earlier shows',
      holdoutLabel: 'Later shows',
      trainShare: 75,
      caption: 'Split on air date',
    },
    signal: { interview: 7, research: 7, applied: 6 },
    curiosity: 8,
    sections: {
      models: sec('good', 'Start here', [
        ['Category baseline', 'Predict a coarse category from the clue with a linear bag-of-words model. The baseline is the majority category. Many “models” only rediscover words that are the category name.'],
        ['Answer retrieval', 'Given a clue, rank candidate answers seen in training. Report recall at 5. A model that can emit any string needs a constrained answer list or it will be unscorable.'],
        ['Value as difficulty', 'Use the dollar value as an ordinal difficulty, not as the text target. Ask whether harder clues are longer or more specific after category is known.'],
      ]),
      statistics: sec('good', 'Included', [
        ['Repeated answers', 'Common answers appear for years. A random split lets the same answer’s clues leak. A time split reduces that and does not remove it. Report how often the test answer was seen in train.'],
        ['Category strings', '“Science” and “Science & Nature” are different strings. Map to a coarse set before you quote an accuracy.'],
      ]),
      interviews: ask('good', 'Screen ready', [
        [
          'Answer leakage',
          'The answer is the label. The category often contains the answer type, and sometimes the clue is a restatement that only makes sense if you have heard the answer on television. A random split also places later clues for the same answer into training.',
          'How do you evaluate a clue-to-answer model?',
          'Split on air date. Constrain decoding to answers observed in training, and report the share of test clues whose answer never appeared. Recall at 5 on that setup is the number. An unconstrained generated string is not comparable.',
        ],
        [
          'Category names',
          'A bag-of-words model can classify “Kings of England” because the clue says king. That is a lexicon, not history understanding.',
          'How do you keep the category model honest?',
          'Map categories to a coarse label set first. Error-analysis the confusions that remain after obvious name words are removed. If accuracy lives only on those words, say the model is a keyword list.',
        ],
        [
          'Dollar value',
          'Clue value changed when the board changed, and Daily Doubles break the scale. Treating dollars as a continuous regression target mixes eras.',
          'How would you use value?',
          'As an ordinal difficulty within an era, or drop Daily Doubles and fit within one board layout. Do not regress raw dollars across the whole file and call the coefficient difficulty.',
        ],
      ]),
      research: sec('idle', 'Ideas', [
        ['Seen answers', 'Measure how much of a retrieval score is memorization of frequent answers. A frequency baseline belongs in the table.'],
        ['Category drift', 'Which coarse categories grow or shrink by decade? That composition chart is a cultural result with no neural net required.'],
      ]),
      applications: sec('idle', 'In practice', [
        ['Quiz tools', 'Retrieval against a fixed answer list is the product shape: suggest a likely response, with the air-date split as the honesty check.'],
        ['Writing aid', 'Category frequencies help a writer see which boards the archive actually contains.'],
      ]),
    },
  },
  {
    ref: 'jrobischon/wikipedia-movie-plots',
    title: 'Wikipedia Movie Plots',
    owner: 'jrobischon',
    topic: 'Text',
    tags: ['Plots', 'Genre', 'Era', 'Origin'],
    rows: 34886,
    rowsLabel: '35 thousand',
    shape: '8 columns',
    summary:
      'Wikipedia plot summaries with genre, year, and origin. Genre labels are multi-way and inconsistent. Predicting genre from the plot is a text exercise with a messy target, which is why it is worth doing carefully.',
    fileNote: 'Plots vary from a sentence to a full synopsis. Genre can list several labels.',
    split: {
      marker: 'Later releases',
      trainLabel: 'Older films',
      holdoutLabel: 'Newer',
      trainShare: 75,
      caption: 'Split on release year',
    },
    signal: { interview: 7, research: 6, applied: 5 },
    curiosity: 7,
    sections: {
      models: sec('good', 'Start here', [
        ['Coarse genre', 'Map genre strings onto a small set of primary labels. A linear bag-of-words model is the baseline. Multi-label only after the single primary label is honest.'],
        ['Length', 'Plot length differs by origin and era. Include log length as a feature and also report a model without it, so you know you are not classifying verbosity.'],
        ['Origin', 'Origin is a strong covariate. A genre score that ignores it may be detecting which wiki section the plot came from.'],
      ]),
      statistics: sec('good', 'Included', [
        ['Label noise', 'The same film can carry “comedy / drama / romance.” Pick a primary-label rule and write it down. Accuracy depends on that rule.'],
        ['Year words', 'Later decades name technologies the earlier plots cannot. A time split is part of the metric, not a nicety.'],
      ]),
      interviews: ask('good', 'Screen ready', [
        [
          'Messy genre',
          'The genre cell is a free string, often several genres at once, spelled differently by origin. Two analysts will compute two accuracies from the same file if they do not share a label rule.',
          'How do you define the target before you fit?',
          'Publish a map from raw strings to a small primary-label set, plus an “other” bin. Fit that. If you move to multi-label, say so and change the metric. Do not quote an accuracy whose label rule lived only in a notebook cell.',
        ],
        [
          'Synopsis length',
          'Some plots are a line and some are a full recap. A model can separate genres by how long the community wrote, especially across wiki editions.',
          'How do you check that you are reading the plot and not its length?',
          'Include log length, then remove it and compare. Also compare scores within a narrow length band. If the genre signal disappears inside the band, the model was measuring the write-up.',
        ],
        [
          'Future films',
          'A random split trains on 2015 plots and tests on 1995 plots. Vocabulary from later decades will not be available to a model that has to tag a new release.',
          'What split matches a catalog that keeps adding films?',
          'Train on earlier release years and test on later ones. Report the drop from the random split. The later-year number is the one that matches the product.',
        ],
      ]),
      research: sec('idle', 'Ideas', [
        ['Origin shift', 'Does the same genre use different words across origins? A simple contrast of high-weight tokens is enough for a short study.'],
        ['Primary versus multi-label', 'Quantify how many films change bucket under two reasonable primary-label rules. The sensitivity is the methods result.'],
      ]),
      applications: sec('idle', 'In practice', [
        ['Catalog tags', 'A coarse tagger can propose a primary genre for a new plot, with a human confirming the multi-genre cases the rule cannot hold.'],
        ['Archive search', 'Even a keyword baseline is a useful search tool once the label map is stable.'],
      ]),
    },
  },
]
