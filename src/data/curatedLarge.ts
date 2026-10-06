import type { CuratedDataset } from '../types/curator'
import { sec } from './section'

export const curatedLarge: CuratedDataset[] = [
  {
    ref: 'grouplens/movielens-20m-dataset',
    title: 'MovieLens 20M',
    owner: 'GroupLens',
    topic: 'Recommendation',
    tags: ['Ranking', 'Cold start', 'Time split', 'Baseline'],
    rows: 20000263,
    rowsLabel: '20 million',
    shape: '3 tables',
    summary:
      'Twenty million movie ratings with user, movie, and timestamp. The standard clean table for learning recommenders before you touch anything more exotic.',
    fileNote: 'ratings.csv is complete. Movies and tags sit beside it.',
    split: {
      marker: 'Last ratings',
      trainLabel: 'Earlier',
      holdoutLabel: 'Latest',
      trainShare: 72,
      caption: 'Split on timestamp',
    },
    signal: { interview: 7, research: 8, applied: 7 },
    sections: {
      models: sec('good', 'Start here', [
        ['Popularity baseline', 'Score every user by the movies with the highest average rating and the most ratings. Beat this before you build anything else.'],
        ['Biased matrix factorization', 'Fit user and movie biases plus a small latent factor model. RMSE is the classic score; also report recall at 10.'],
        ['Time-aware holdout', 'Train on earlier timestamps and test on later ones. A random split lets a movie leak into both sides.'],
      ]),
      statistics: sec('good', 'Included', [
        ['Rating shrinkage', 'A movie with two ratings at 5.0 is not better than one with 500 ratings at 4.3. Shrink means toward the global average by rating count.'],
        ['User activity', 'Plot ratings per user. A handful of very active users dominate a random sample, so say so when you quote an average.'],
      ]),
      interviews: sec('good', 'Screen ready', [
        ['Why not accuracy?', 'Ratings are ordered, and a product cares which titles you show, not whether you called a 4 a 5. Talk about ranking.'],
        ['Cold start', 'What do you show a user with no ratings, and a movie with none? Popularity and content features are the honest answer.'],
        ['Leakage', 'If the test row is a later rating from a user who is also in train, say which information you are allowing across the cut.'],
      ]),
      research: sec('idle', 'Ideas', [
        ['Temporal evaluation', 'Replicate the finding that a random split overstates recommender quality. The GroupLens write-ups are the starting citation.'],
        ['Exposure', 'Ask whether the top of the list collapses onto a few blockbusters, and measure coverage as well as error.'],
      ]),
      applications: sec('idle', 'In practice', [
        ['Home-screen rows', 'The same baseline-then-rank pattern is how streaming and retail carousels are checked before a heavier model ships.'],
        ['Catalog search', 'A strong popularity prior still decides what to show when a query is vague or a title is new.'],
      ]),
    },
  },
  {
    ref: 'sobhanmoosavi/us-accidents',
    title: 'US Accidents',
    owner: 'Sobhan Moosavi',
    topic: 'Classification',
    tags: ['Severity', 'Spatial', 'Imbalance', 'Weather'],
    rows: 7728394,
    rowsLabel: '7.7 million',
    shape: '46 columns',
    summary:
      'A large, documented table of US traffic accidents from 2016 to 2023, with time, place, and weather. Use it to practice severity models and place-level counts, not to score individual drivers.',
    fileNote: 'One wide CSV. Severity is uneven across levels.',
    split: {
      marker: 'Later years',
      trainLabel: '2016–2021',
      holdoutLabel: '2022–23',
      trainShare: 68,
      caption: 'Time-ordered split',
    },
    signal: { interview: 6, research: 7, applied: 7 },
    sections: {
      models: sec('good', 'Start here', [
        ['Severity classifier', 'Predict Severity from start hour, state, weather, and road features known at the start of the record. Report balanced accuracy, not raw accuracy.'],
        ['Gradient boosting vs logistic', 'A logistic model on a few weather and time fields is the baseline. A tree model should beat it on multiclass log loss, or you do not need it.'],
        ['County counts', 'Aggregate to weekly accident counts by county and fit a simple seasonal model. This is often the more useful target.'],
      ]),
      statistics: sec('good', 'Included', [
        ['Base rates by state', 'Severity mixes differ by state because reporting differs. Show the mix before you claim a model has learned weather.'],
        ['Weather missingness', 'Precipitation and wind are missing in patterns. Compare complete-case results with a missing indicator.'],
      ]),
      interviews: sec('good', 'Screen ready', [
        ['What is the decision?', 'A hiring manager will ask who acts on the score. Hotspot staffing is a fair answer. Scoring people is not.'],
        ['Train and test in time', 'Why is a random row split too kind when the road network and the reporting process both drift?'],
        ['Class balance', 'If most rows are one severity, what metric would you refuse to put on a slide?'],
      ]),
      research: sec('idle', 'Ideas', [
        ['Reporting bias', 'Treat the table as reported accidents, and ask how weather effects change after you condition on state and hour.'],
        ['Spatial residuals', 'Map where the model is systematically wrong. Those patches are the research question, not a nuisance.'],
      ]),
      applications: sec('warn', 'Counts, not people', [
        ['Operations', 'Departments use incident histories to place response resources and to study corridors with repeat reports.'],
        ['Routing context', 'A count model can flag times of day when a corridor is repeatedly disrupted. It does not explain fault.'],
      ]),
    },
  },
  {
    ref: 'chicago/chicago-crime',
    title: 'Chicago Crime',
    owner: 'City of Chicago',
    topic: 'Time series',
    tags: ['Counts', 'Seasonality', 'Poisson', 'Place'],
    rows: 7000000,
    rowsLabel: '7 million+',
    shape: '22 columns',
    summary:
      'A long public log of reported incidents in Chicago: type, time, and place. The study worth doing is a count model of reports over time, plus a clear statement of what a police report is not.',
    fileNote: 'City extract, updated over time. Row count moves.',
    split: {
      marker: 'Last year',
      trainLabel: 'History',
      holdoutLabel: 'Latest',
      trainShare: 74,
      caption: 'Forecast next year',
    },
    signal: { interview: 6, research: 7, applied: 5 },
    sections: {
      models: sec('good', 'Start here', [
        ['Weekly counts', 'Collapse to weekly counts of a few primary types. Fit a seasonal naive forecast, then a Poisson or negative binomial model with month and trend.'],
        ['Type mix', 'A multinomial or simple share model for primary type over years. The question is composition, not a person-level score.'],
        ['Beat time series', 'Pick a handful of beats and compare their seasonal curves. Do not fit a separate black-box model per block.'],
      ]),
      statistics: sec('warn', 'Measurement', [
        ['Overdispersion', 'Weekly counts are usually more variable than a Poisson allows. A negative binomial, or a quasi-Poisson check, belongs in the write-up.'],
        ['What is counted', 'This is reported incidents. Clearance, arrest, and true occurrence are different measurements. Say which one you have.'],
      ]),
      interviews: sec('good', 'Screen ready', [
        ['Why not predict arrest?', 'Arrest is a justice outcome, not a neutral label. A strong interview answer refuses an individual risk score and offers a count model instead.'],
        ['Seasonality', 'How would you check that a drop in January is a calendar effect and not a reporting change?'],
        ['Spatial unit', 'What happens to your conclusions if you switch from beat to ward?'],
      ]),
      research: sec('idle', 'Ideas', [
        ['Interrupted series', 'Use the weekly counts to study a policy date with a comparison area, and show the pre-trend first.'],
        ['Reporting changes', 'Look for level shifts that line up with definition or system changes rather than with behavior.'],
      ]),
      applications: sec('warn', 'Do not score people', [
        ['Public dashboards', 'Cities publish these series so residents can see trends. A clear seasonal chart is the product.'],
        ['Evaluation', 'Count models are how analysts check whether a place-based program changed reports, with the measurement caveat attached.'],
      ]),
    },
  },
  {
    ref: 'usdot/flight-delays',
    title: '2015 Flight Delays',
    owner: 'US DOT',
    topic: 'Classification',
    tags: ['Delays', 'Joins', 'Leakage', 'Calibration'],
    rows: 5819079,
    rowsLabel: '5.8 million',
    shape: '3 tables',
    summary:
      'Every US flight in 2015, plus airline and airport lookups. A large, tidy operations table for predicting a 15-minute delay from information you would have had at scheduling time.',
    fileNote: 'flights.csv plus two small lookup tables.',
    split: {
      marker: 'November',
      trainLabel: 'Jan–Oct',
      holdoutLabel: 'Nov–Dec',
      trainShare: 78,
      caption: 'Hold out the holidays',
    },
    signal: { interview: 8, research: 6, applied: 8 },
    sections: {
      models: sec('warn', 'Delay causes leak', [
        ['Departure delay over 15 minutes', 'Predict DepDel15 from scheduled hour, carrier, origin, destination, and distance. Leave out CarrierDelay, WeatherDelay, and the other cause fields. Those are filled in after the delay.'],
        ['Logistic vs tree', 'A logistic regression on hour and carrier is the baseline. A gradient-boosted tree should earn its place on PR-AUC or log loss.'],
        ['Carrier rates', 'Compute each carrier delay rate on the training months only, then join it back. Computing it on the full year leaks the answer.'],
      ]),
      statistics: sec('good', 'Included', [
        ['Calibration by hour', 'A 6am flight and a 7pm flight do not share a delay rate. Plot predicted probability against the observed rate by hour.'],
        ['Cancellation vs delay', 'Cancelled flights are a different outcome. Decide whether they are out of the delay model, and write that down.'],
      ]),
      interviews: sec('good', 'Screen ready', [
        ['Name the leakage', 'Which columns are only known after the plane has already been late? This is a standard screen question.'],
        ['Join design', 'How do you attach airline names without duplicating flight rows?'],
        ['Threshold', 'If operations can only rebook 5% of flights, how do you pick the cutoff?'],
      ]),
      research: sec('idle', 'Ideas', [
        ['Delay propagation', 'Ask how much of an arrival delay was already present at departure, using only the scheduled plan plus origin delay.'],
        ['Holiday shift', 'Test whether a model fit on spring still calibrates in the last two weeks of December.'],
      ]),
      applications: sec('idle', 'In practice', [
        ['Connection buffers', 'Airlines and airports use delay probabilities to decide how much slack a connection needs.'],
        ['Crew and gates', 'The same score feeds staffing on banks of departures that historically slip together.'],
      ]),
    },
  },
  {
    ref: 'kazanova/sentiment140',
    title: 'Sentiment140',
    owner: 'Sentiment140',
    topic: 'Text',
    tags: ['Tweets', 'Noisy labels', 'TF-IDF', 'Distant supervision'],
    rows: 1600000,
    rowsLabel: '1.6 million',
    shape: '6 columns',
    summary:
      '1.6 million tweets labeled positive or negative from the emoticons that were stripped out of the text. Huge, simple, and honest about noisy labels.',
    fileNote: 'Polarity is 0 or 4. Labels come from emoticons.',
    split: {
      marker: 'Later tweets',
      trainLabel: 'Earlier',
      holdoutLabel: 'Latest',
      trainShare: 70,
      caption: 'Split on tweet date',
    },
    signal: { interview: 7, research: 6, applied: 6 },
    sections: {
      models: sec('warn', 'Noisy labels', [
        ['TF-IDF plus logistic regression', 'Bag-of-words or TF-IDF with a logistic regression is the right first model. It will beat a naive majority baseline and it is easy to explain.'],
        ['Naive Bayes comparison', 'Multinomial naive Bayes on the same features is the other classic. Compare calibration, not just accuracy.'],
        ['Label noise check', 'Hand-read 50 mistakes. Many will be sarcastic or neutral tweets that only looked positive because of an emoticon.'],
      ]),
      statistics: sec('good', 'Included', [
        ['Agreement ceiling', 'Because labels are distant, even a careful human will not match them perfectly. Estimate that ceiling before you chase another point of accuracy.'],
        ['Word rates', 'Report log-odds of tokens between classes. Those words are the model, and they are what you would show a reviewer.'],
      ]),
      interviews: sec('good', 'Screen ready', [
        ['Where do the labels come from?', 'If you cannot say emoticons, you are not ready to discuss this file.'],
        ['Why a linear model?', 'What do you gain from a transformer on noisy binary labels, and how would you know it was worth the cost?'],
        ['Split unit', 'Why is splitting by time safer than splitting by random tweet when topics drift?'],
      ]),
      research: sec('idle', 'Ideas', [
        ['Distant supervision', 'Use this as a replication of emoticon-trained sentiment, and measure how much a small hand-labeled set changes the model.'],
        ['Drift', 'Train on April and test on June. The drop is the research result.'],
      ]),
      applications: sec('idle', 'In practice', [
        ['Social listening', 'Brands still start with a linear text model to track whether a launch is being discussed warmly or not.'],
        ['Triage', 'A noisy score is enough to route a sample of posts to a person. It is a weak reason to auto-reply.'],
      ]),
    },
  },
  {
    ref: 'meirnizri/covid19-dataset',
    title: 'COVID-19 symptoms',
    owner: 'Meir Nizri',
    topic: 'Classification',
    tags: ['Symptoms', 'Calibration', 'Base rate', 'Screening'],
    rows: 1000000,
    rowsLabel: '1 million',
    shape: '10 columns',
    summary:
      'A large table of yes/no symptom flags tied to a COVID test result. Useful for a first logistic model and a calibration plot. It is not a diagnostic device and should not be treated as one.',
    fileNote: 'About a million tested people. Extracts vary, so check the file.',
    split: {
      marker: 'Random cut',
      trainLabel: 'Fit',
      holdoutLabel: 'Check',
      trainShare: 70,
      caption: 'Stratified split',
    },
    signal: { interview: 6, research: 5, applied: 4 },
    sections: {
      models: sec('good', 'Start here', [
        ['Logistic regression', 'Fit the test result on cough, fever, and the other symptom flags. Coefficients are the point of the exercise.'],
        ['Probability, not accuracy', 'Report the base rate, then Brier score and a calibration curve. Accuracy will look strong if most tests are negative.'],
        ['A tree as a check', 'A shallow tree should rediscover the same symptoms. If it needs deep interactions, be suspicious.'],
      ]),
      statistics: sec('good', 'Included', [
        ['Odds ratios', 'Report odds ratios with confidence intervals for each symptom, and say they are associations in tested people, not effects in the general public.'],
        ['Who was tested', 'Test indication is part of the table. The sample is people who were tested, which is not everyone who had symptoms.'],
      ]),
      interviews: sec('good', 'Screen ready', [
        ['What would you refuse to ship?', 'A slide that says the model diagnoses COVID. The honest slide says it ranks symptom patterns among people already tested.'],
        ['Base rate shift', 'If the positive rate halves next month, which of your metrics survive?'],
        ['Leakage', 'Which fields describe the test process rather than the symptoms?'],
      ]),
      research: sec('idle', 'Ideas', [
        ['Selection', 'Study how the symptom coefficients change when you stratify by why the person was tested.'],
        ['Calibration under shift', 'A small methods note on recalibrating a logistic model when prevalence changes.'],
      ]),
      applications: sec('warn', 'Not a diagnosis', [
        ['Triage context', 'Health systems use symptom questionnaires to decide who to test. A published model is a teaching tool here, not a clinical product.'],
        ['Reporting', 'The useful artifact is a calibrated probability with a stated population, not a yes/no badge.'],
      ]),
    },
  },
  {
    ref: 'uciml/forest-cover-type-dataset',
    title: 'Forest Cover Type',
    owner: 'UCI',
    topic: 'Classification',
    tags: ['Multiclass', 'No missing', 'Elevation', 'Ecology'],
    rows: 581012,
    rowsLabel: '581,012',
    shape: '55 columns',
    summary:
      '581,012 forest patches with cartographic measurements and a cover-type label. No missing values. A clean multiclass problem where elevation does most of the work.',
    fileNote: 'Complete numeric table. Classes 1 and 2 dominate.',
    split: {
      marker: 'Random cut',
      trainLabel: 'Fit',
      holdoutLabel: 'Check',
      trainShare: 70,
      caption: 'Stratified multiclass split',
    },
    signal: { interview: 6, research: 6, applied: 5 },
    sections: {
      models: sec('good', 'Start here', [
        ['Multinomial logistic', 'Start here. Wilderness area and soil type are already one-hot, so the linear model is readable.'],
        ['Random forest', 'Compare balanced accuracy and log loss. The forest will use elevation heavily. Show variable importance next to the logistic coefficients.'],
        ['Collapse the rare classes', 'Refit after grouping the small cover types, and see whether the headline score was a two-class story.'],
      ]),
      statistics: sec('good', 'Included', [
        ['Class prior', 'Report the share of each cover type. Accuracy without that table is not interpretable.'],
        ['Elevation bands', 'Plot cover type against elevation. A model that ignores this curve is missing the mechanism.'],
      ]),
      interviews: sec('good', 'Screen ready', [
        ['Metric for seven classes', 'Which single number would you show, and which class-wise numbers would you refuse to hide?'],
        ['One-hot soil', 'How do you keep forty soil indicators from looking like forty discoveries?'],
        ['Scale', 'Half a million rows is enough to talk about training time versus a linear baseline.'],
      ]),
      research: sec('idle', 'Ideas', [
        ['Ecological baseline', 'Blackard and Dean introduced this task. A short replication asks how far elevation plus wilderness area gets you alone.'],
        ['Spatial dependence', 'Nearby patches are not independent. Discuss what a random split assumes.'],
      ]),
      applications: sec('idle', 'In practice', [
        ['Land cover', 'Agencies map vegetation from terrain and soil when a field visit is expensive. This file is the teaching version of that job.'],
        ['Survey design', 'The class imbalance is a reminder to sample rare cover types on purpose.'],
      ]),
    },
  },
  {
    ref: 'snap/amazon-fine-food-reviews',
    title: 'Amazon Fine Food Reviews',
    owner: 'Stanford SNAP',
    topic: 'Text',
    tags: ['Reviews', 'Stars', 'TF-IDF', 'Time split'],
    rows: 568454,
    rowsLabel: '568,454',
    shape: '10 columns',
    summary:
      'More than half a million fine-food reviews with stars, text, and a time. A proper text-plus-tabular table: mostly 5-star, so accuracy is a trap.',
    fileNote: 'One review per row. Scores pile up at 5.',
    split: {
      marker: 'Later reviews',
      trainLabel: 'Earlier',
      holdoutLabel: 'Latest',
      trainShare: 70,
      caption: 'Split on review time',
    },
    signal: { interview: 7, research: 6, applied: 7 },
    sections: {
      models: sec('warn', 'Mostly 5 stars', [
        ['TF-IDF logistic for 5-star vs rest', 'Binary is the clean first task. Report precision and recall, because predicting "5 stars" for everyone scores well.'],
        ['Helpfulness', 'A second target is whether other shoppers found the review helpful. Do not use the score text and the helpfulness votes as if they were independent stories without saying so.'],
        ['User mean baseline', 'Some users always score high. A user-average baseline, computed on train only, is the number to beat.'],
      ]),
      statistics: sec('good', 'Included', [
        ['Score distribution', 'Show the 1-through-5 histogram before any model. The modelling choice follows from that picture.'],
        ['Duplicate text', 'The same review text can appear more than once. Count duplicates and decide whether the split should be by review text.'],
      ]),
      interviews: sec('good', 'Screen ready', [
        ['Imbalanced stars', 'Why is accuracy a poor headline when most reviews are positive?'],
        ['Target definition', 'Would you predict stars, a helpful vote, or a low-star alert, and who is the user of that prediction?'],
        ['Time split', 'What leaks if the same product appears in train and test with a later review?'],
      ]),
      research: sec('idle', 'Ideas', [
        ['Helpfulness bias', 'Study whether longer or earlier reviews attract more votes, separate from star rating.'],
        ['Product shift', 'Train on one set of products and test on products that appear only later.'],
      ]),
      applications: sec('idle', 'In practice', [
        ['Catalog quality', 'Marketplaces rank and spot low-star bursts so a merchant can answer them.'],
        ['Search snippets', 'A simple text score still decides which review excerpt to show on a product page.'],
      ]),
    },
  },
  {
    ref: 'carrie1/ecommerce-data',
    title: 'Online Retail',
    owner: 'UCI',
    topic: 'Clustering',
    tags: ['RFM', 'Returns', 'Cohorts', 'Segmentation'],
    rows: 541909,
    rowsLabel: '541,909',
    shape: '8 columns',
    summary:
      'More than half a million UK online-retail invoice lines from 2010–2011. The clean project is RFM segmentation, after you treat returns and guest checkouts on purpose.',
    fileNote: 'Invoice lines. Some quantities are negative.',
    split: {
      marker: 'Last 8 weeks',
      trainLabel: 'History',
      holdoutLabel: 'Latest',
      trainShare: 75,
      caption: 'Segment, then check later',
    },
    signal: { interview: 8, research: 6, applied: 8 },
    sections: {
      models: sec('warn', 'Returns', [
        ['RFM table', 'Build one row per CustomerID: recency, frequency, and monetary value, using invoices through a cutoff date. Drop rows with no customer id, or keep them as guests and say so.'],
        ['Quartile rules vs k-means', 'Score R, F, and M into quartiles first. Then fit k-means on the scaled RFM values. If k-means does not change a decision the quartiles already support, keep the quartiles.'],
        ['Return handling', 'Negative quantities are cancellations. Decide whether monetary value nets them out, and show both versions.'],
      ]),
      statistics: sec('good', 'Included', [
        ['Concentration', 'Report the share of revenue from the top 10% of customers. That single number frames every segment.'],
        ['Cohort retention', 'A monthly cohort chart of repeat purchase is the statistical picture. Segments should agree with it.'],
      ]),
      interviews: sec('good', 'Screen ready', [
        ['Define the customer', 'What do you do with missing CustomerID, and with a customer who only ever returned items?'],
        ['Why cluster?', 'What action changes if two segments merge? If nothing changes, do not present eight clusters.'],
        ['Leakage in recency', 'How do you compute recency without using purchases from after the decision date?'],
      ]),
      research: sec('idle', 'Ideas', [
        ['Stability', 'Refit the segments on a later cutoff and measure how many customers switch labels.'],
        ['Lifetime value', 'A simple purchase-rate model by segment is a better research step than another clustering algorithm.'],
      ]),
      applications: sec('idle', 'In practice', [
        ['Retention offers', 'Retailers use recency and frequency to decide who gets a reminder, not a neural net.'],
        ['Inventory of demand', 'The invoice lines also answer which products travel together, once returns are handled.'],
      ]),
    },
  },
  {
    ref: 'austinreese/craigslist-carstrucks-data',
    title: 'Used Cars',
    owner: 'Austin Reese',
    topic: 'Regression',
    tags: ['Pricing', 'Outliers', 'Odometer', 'Log price'],
    rows: 426880,
    rowsLabel: '427,000',
    shape: '26 columns',
    summary:
      'Hundreds of thousands of used-vehicle listings with price, year, odometer, and place. Large and simple. Drop impossible prices before you fit anything.',
    fileNote: 'Listings, not transactions. Filter extreme prices.',
    split: {
      marker: 'By region',
      trainLabel: 'Most states',
      holdoutLabel: 'Held states',
      trainShare: 75,
      caption: 'Geographic holdout',
    },
    signal: { interview: 7, research: 5, applied: 7 },
    sections: {
      models: sec('warn', 'Clean prices first', [
        ['Log price regression', 'After dropping prices below a few hundred dollars and far above a reasonable luxury cap, regress log price on year, odometer, make, and condition.'],
        ['Tree comparison', 'A gradient-boosted tree on the same fields will catch make-model quirks. Compare it to the linear model on median absolute error.'],
        ['State holdout', 'Train without a few states and test on them, so the model cannot memorize local posting habits.'],
      ]),
      statistics: sec('good', 'Included', [
        ['Price by year', 'Show median price and odometer by model year. The depreciation curve is the result people remember.'],
        ['Missing odometer', 'Odometer is often missing. Compare a complete-case fit with a missing indicator rather than filling zeros.'],
      ]),
      interviews: sec('good', 'Screen ready', [
        ['Outliers', 'A price of 1 dollar and a price of 100 million should never enter the loss. How do you find them without peeking at the test set?'],
        ['Log versus raw', 'Why is median absolute error kinder than RMSE on listing prices?'],
        ['Listing versus sale', 'This is an asking price. What changes if the business needs a transaction price?'],
      ]),
      research: sec('idle', 'Ideas', [
        ['Geographic shift', 'Measure how much a national pricing model degrades in a state it did not train on.'],
        ['Condition text', 'A small add-on is whether the free-text description improves price error after year and miles are in the model.'],
      ]),
      applications: sec('idle', 'In practice', [
        ['Guide prices', 'Marketplaces show a range next to a listing. The range comes from year, miles, and trim, with humans reviewing the tails.'],
        ['Inventory buying', 'Dealers use the same residual to spot listings priced far from similar vehicles.'],
      ]),
    },
  },
  {
    ref: 'kamilpytlak/personal-key-indicators-of-heart-disease',
    title: 'Heart Disease Indicators',
    owner: 'CDC BRFSS',
    topic: 'Classification',
    tags: ['Survey', 'Risk', 'Imbalance', 'Odds ratios'],
    rows: 319795,
    rowsLabel: '320,000',
    shape: '18 columns',
    summary:
      'A large CDC survey extract with health indicators and a heart-disease flag. Clean enough for logistic regression and honest about being self-report, not a clinic chart.',
    fileNote: 'About 320,000 survey responses. Not clinical records.',
    split: {
      marker: 'Random cut',
      trainLabel: 'Fit',
      holdoutLabel: 'Check',
      trainShare: 70,
      caption: 'Stratified split',
    },
    signal: { interview: 7, research: 6, applied: 4 },
    sections: {
      models: sec('good', 'Start here', [
        ['Logistic regression', 'Fit the heart-disease flag on smoking, age band, general health, diabetes, and activity. Keep age as categories, not a fake numeric scale, unless you justify the spacing.'],
        ['Class weight', 'The flag is uncommon. Compare an unweighted model and a balanced one on PR-AUC and on a calibration plot.'],
        ['Shallow tree', 'Use it to show interactions a stakeholder can read, then check that the logistic model still matches its story.'],
      ]),
      statistics: sec('good', 'Included', [
        ['Odds ratios', 'Publish intervals, not just coefficients. State that these are survey associations.'],
        ['Age confounding', 'Refit with and without age. Several lifestyle coefficients will shrink. That comparison is the analysis.'],
      ]),
      interviews: sec('good', 'Screen ready', [
        ['Survey versus clinic', 'Why is a self-reported flag a weak label for a diagnostic product?'],
        ['Protected fields', 'Race and sex are in many extracts. When would you exclude them from a model that ranks people?'],
        ['Metric', 'What happens to accuracy if you predict "no disease" for everyone?'],
      ]),
      research: sec('idle', 'Ideas', [
        ['Transportability', 'Ask whether associations estimated in one age band hold in another.'],
        ['Self-report error', 'A short discussion of how misclassified outcomes bias a logistic coefficient.'],
      ]),
      applications: sec('warn', 'Not clinical', [
        ['Population description', 'Public-health teams use surveys like BRFSS to describe groups, not to diagnose a person in front of them.'],
        ['Question design', 'The useful product is which questions separate groups, so a longer form can be shortened.'],
      ]),
    },
  },
  {
    ref: 'mlg-ulb/creditcardfraud',
    title: 'Credit Card Fraud',
    owner: 'ULB Machine Learning Group',
    topic: 'Classification',
    tags: ['Imbalance', 'PR-AUC', 'Thresholds', 'Calibration'],
    rows: 284807,
    rowsLabel: '284,807',
    shape: '31 columns',
    summary:
      '284,807 European card transactions over two days, with 492 frauds. Amount and time are raw. The other fields are PCA components. This is the clean reference table for rare-event classification.',
    fileNote: 'Single numeric CSV. About 0.17% fraud.',
    split: {
      marker: 'Later seconds',
      trainLabel: 'Earlier',
      holdoutLabel: 'Later',
      trainShare: 70,
      caption: 'Time-ordered split',
    },
    signal: { interview: 8, research: 7, applied: 8 },
    sections: {
      models: sec('good', 'Start here', [
        ['Logistic regression', 'Fit Class on Time, Amount, and V1–V28. This is the model you should be able to explain line by line.'],
        ['Boosted trees', 'Compare PR-AUC and precision at a fixed recall. Accuracy will sit near 99.8% if you call every row genuine.'],
        ['Thresholds', 'Pick a cutoff for a fixed review budget, for example the riskiest 1% of transactions, and report precision in that slice.'],
      ]),
      statistics: sec('warn', 'Skip accuracy', [
        ['Base rate', '492 frauds out of 284,807 is about 0.172%. Put a confidence interval on that share.'],
        ['Calibration', 'Plot predicted probability against the observed fraud rate. A ranking model can be useless as a probability.'],
      ]),
      interviews: sec('good', 'Screen ready', [
        ['Why accuracy fails', 'Walk through the all-genuine classifier. This question shows up constantly in data-role screens.'],
        ['PCA limits', 'Why can you not tell a story about V12 as if it were a merchant category?'],
        ['Label delay', 'In production the fraud label often arrives days later. What does that do to a random split?'],
      ]),
      research: sec('idle', 'Ideas', [
        ['Verification latency', 'The ULB line of work, including Dal Pozzolo and collaborators, studies labels that are confirmed late. This file is the usual replication set.'],
        ['Cost curves', 'Turn Amount into a simple cost and show how the preferred threshold moves.'],
      ]),
      applications: sec('idle', 'In practice', [
        ['Issuer review queues', 'A score sorts transactions so analysts see the risky slice, with a human still making the block decision.'],
        ['Same pattern elsewhere', 'Ad-click fraud and fake accounts are the same shape: rare labels, costly false alarms, and a threshold set by staffing.'],
      ]),
    },
  },
]
