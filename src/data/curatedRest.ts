import type { CuratedDataset } from '../types/curator'
import { sec } from './section'

export const curatedRest: CuratedDataset[] = [
  {
    ref: 'jsphyg/weather-dataset-rattle-package',
    title: 'Rain in Australia',
    owner: 'Bureau of Meteorology',
    topic: 'Classification',
    tags: ['Weather', 'Missing data', 'Leakage', 'Calibration'],
    rows: 145460,
    rowsLabel: '145,460',
    shape: '23 columns',
    summary:
      'About ten years of daily Australian weather, with a yes/no for rain tomorrow. Well documented, and famous for one column you must drop before you trust a score.',
    fileNote: 'Daily station rows. Drop RISK_MM if it is present.',
    split: {
      marker: 'Last years',
      trainLabel: 'Earlier',
      holdoutLabel: 'Latest',
      trainShare: 70,
      caption: 'Chronological split',
    },
    signal: { interview: 8, research: 6, applied: 6 },
    sections: {
      models: sec('warn', 'Drop RISK_MM', [
        ['Logistic regression', 'Predict RainTomorrow from humidity, pressure, wind, and rainfall today. If RISK_MM is in the file, drop it. It is the amount of rain tomorrow, which is the answer.'],
        ['Missingness', 'Sunshine and evaporation are missing in blocks. Add missing indicators rather than filling a global mean and moving on.'],
        ['Location model', 'Compare one national model with a model that includes location, and say whether you are forecasting a station or an average day.'],
      ]),
      statistics: sec('good', 'Included', [
        ['Base rate by station', 'Rain tomorrow is not equally common in every location. Show the rates before comparing accuracies.'],
        ['Calibration by month', 'A model can rank wet days and still be overconfident in the dry season. Plot that.'],
      ]),
      interviews: sec('good', 'Screen ready', [
        ['Name the leak', 'What is RISK_MM, and why does a model that uses it look brilliant?'],
        ['Random split', 'Why does shuffling days flatter a weather model?'],
        ['Missing data', 'When is a missing sunshine value itself a useful signal?'],
      ]),
      research: sec('idle', 'Ideas', [
        ['Station shift', 'Train on southern stations and test on northern ones. The drop is a small domain-shift study.'],
        ['Probability forecasts', 'Score with Brier score and reliability diagrams, which is how weather probabilities are actually judged.'],
      ]),
      applications: sec('idle', 'In practice', [
        ['Operations planning', 'Construction, aviation, and events plan around a probability of rain, not a hard yes.'],
        ['Local models', 'A national score is a baseline. A station still wants its own calibration.'],
      ]),
    },
  },
  {
    ref: 'zynicide/wine-reviews',
    title: 'Wine Reviews',
    owner: 'Wine Enthusiast',
    topic: 'Regression',
    tags: ['Points', 'Price', 'Text', 'Tasters'],
    rows: 129971,
    rowsLabel: '130,000',
    shape: '13 columns',
    summary:
      'About 130,000 professional wine reviews with points, price, variety, and place. A clean regression-and-text table, with missing prices and a taster effect you should not ignore.',
    fileNote: 'Review rows. Price is often missing.',
    split: {
      marker: 'By taster',
      trainLabel: 'Most tasters',
      holdoutLabel: 'Held tasters',
      trainShare: 72,
      caption: 'Hold out a taster',
    },
    signal: { interview: 6, research: 6, applied: 6 },
    sections: {
      models: sec('good', 'Start here', [
        ['Points from variety and place', 'A linear model on variety, country, and province is the baseline for the 80–100 point score.'],
        ['Text model', 'TF-IDF on the description, compared with the tabular model. The question is how much the prose adds after variety is known.'],
        ['Price model', 'Log price, fit only on rows where price is present. Do not fill missing prices with the mean and then predict them.'],
      ]),
      statistics: sec('good', 'Included', [
        ['Taster effects', 'Mean points differ by taster. A mixed model, or taster fixed effects, stops you from calling a taster habit a regional effect.'],
        ['Missing price', 'Compare wines with and without a price. Missingness is not random, and it changes the sample.'],
      ]),
      interviews: sec('good', 'Screen ready', [
        ['Who is scoring?', 'If points move with the taster, what does a model of wine quality actually measure?'],
        ['Text leakage', 'The description was written by the same person who assigned the points. When is that fair to use?'],
        ['Metric', 'Why report median absolute error on a bounded score?'],
      ]),
      research: sec('idle', 'Ideas', [
        ['Expert consistency', 'Estimate how much of the point variance is taster, variety, and residual.'],
        ['Price and points', 'A hedonic regression of log price on points, variety, and region, with the sample restriction stated.'],
      ]),
      applications: sec('idle', 'In practice', [
        ['Catalog copy', 'Shops use variety, region, and review text to group bottles and to spot outliers in a price list.'],
        ['Assortment', 'A simple points-versus-price residual is enough to flag bottles that look expensive for their peers.'],
      ]),
    },
  },
  {
    ref: 'jessemostipak/hotel-booking-demand',
    title: 'Hotel Booking Demand',
    owner: 'Antonio, Almeida, and Nunes',
    topic: 'Classification',
    tags: ['Cancellations', 'Leakage', 'Lead time', 'Overbooking'],
    rows: 119390,
    rowsLabel: '119,390',
    shape: '32 columns',
    summary:
      '119,390 city and resort hotel bookings from a published dataset. The modelling question is cancellation, and the file includes columns you would not have had when the guest booked.',
    fileNote: 'One booking per row. From a Data in Brief paper.',
    split: {
      marker: 'Later arrivals',
      trainLabel: 'Earlier',
      holdoutLabel: 'Latest',
      trainShare: 70,
      caption: 'Split on arrival date',
    },
    signal: { interview: 8, research: 7, applied: 8 },
    sections: {
      models: sec('warn', 'Status leaks', [
        ['Cancellation model', 'Predict is_canceled from lead time, segment, deposit type, previous cancellations, and country. Drop reservation_status. It is assigned after the stay is resolved.'],
        ['Lead time curve', 'A logistic model with lead time and hotel type is the baseline. Add a tree only if it beats log loss on a later arrival month.'],
        ['Two hotels', 'Fit city and resort separately, or include the interaction. They do not cancel on the same schedule.'],
      ]),
      statistics: sec('good', 'Included', [
        ['Cancellation rate', 'Report the rate by hotel and by month, with intervals. The seasonal plot is the result even before a model.'],
        ['Deposit type', 'Non-refundable bookings rarely cancel. Show that table so the model is not credited for an obvious rule.'],
      ]),
      interviews: sec('good', 'Screen ready', [
        ['Leakage columns', 'Which fields are known only after arrival or cancellation? This is one of the cleaner interview examples.'],
        ['Decision', 'If the hotel overbooks from this score, what is the cost of a false alarm versus an empty room?'],
        ['Time split', 'Why must the holdout be later arrivals rather than random bookings?'],
      ]),
      research: sec('idle', 'Ideas', [
        ['Replication', 'The source paper is Antonio, Almeida, and Nunes, Data in Brief, 2019. A short replication of the cancellation description is a real project.'],
        ['Policy simulation', 'Turn predicted cancellation rates into a simple overbooking curve and show the assumed no-show cost.'],
      ]),
      applications: sec('idle', 'In practice', [
        ['Overbooking', 'Hotels still decide how many rooms to resell from historical cancellation curves, with a person setting the risk.'],
        ['Deposit rules', 'The deposit-type table is the sort of evidence a revenue manager uses to change a policy.'],
      ]),
    },
  },
  {
    ref: 'olistbr/brazilian-ecommerce',
    title: 'Brazilian E-Commerce',
    owner: 'Olist',
    topic: 'Regression',
    tags: ['Delivery', 'Joins', 'Reviews', 'Logistics'],
    rows: 99441,
    rowsLabel: '99,441',
    shape: '9 tables',
    summary:
      'About 100,000 Brazilian marketplace orders, already split into clean related tables: orders, items, payments, reviews, customers, and sellers. The work is defining a target and joining carefully.',
    fileNote: 'Nine CSVs. Orders are the spine.',
    split: {
      marker: 'Later purchases',
      trainLabel: 'Earlier',
      holdoutLabel: 'Latest',
      trainShare: 70,
      caption: 'Split on purchase time',
    },
    signal: { interview: 8, research: 6, applied: 8 },
    sections: {
      models: sec('warn', 'Review text leaks', [
        ['Delivery days', 'Target is delivered date minus purchase date, on orders that were actually delivered. Predictors are purchase-time fields: product size, freight, seller state, customer state.'],
        ['Late versus promised', 'A second target is whether delivery beat the estimated date. Compare a linear model with a tree on absolute error in days.'],
        ['Review score', 'If you predict the review score, do not feed the review text in. The text was written with the score.'],
      ]),
      statistics: sec('good', 'Included', [
        ['Promise error', 'Plot actual minus estimated delivery. The bias of the promise is more useful than a fancy model of it.'],
        ['State pairs', 'Average delivery time for the busiest seller-state to customer-state pairs, with counts so tiny lanes do not dominate.'],
      ]),
      interviews: sec('good', 'Screen ready', [
        ['Define the row', 'Is the modelling unit an order, an item, or a payment? What breaks if you join items before aggregating?'],
        ['Target leakage', 'Which timestamps are unknown on the day the order is placed?'],
        ['Missing delivery', 'What do you do with orders that were cancelled or never delivered?'],
      ]),
      research: sec('idle', 'Ideas', [
        ['Promise calibration', 'Study whether estimated dates are systematically early, and whether the bias depends on distance.'],
        ['Review after delay', 'Estimate the association between days late and review score, without using the review text as a cause.'],
      ]),
      applications: sec('idle', 'In practice', [
        ['Delivery promises', 'Marketplaces set the date they show at checkout from historical lane times, then watch the error.'],
        ['Seller ops', 'A slow seller-state pair is an operations conversation, not only a model feature.'],
      ]),
    },
  },
  {
    ref: 'sulianova/cardiovascular-disease-dataset',
    title: 'Cardiovascular Disease',
    owner: 'Svetlana Ulianova',
    topic: 'Classification',
    tags: ['Risk', 'Blood pressure', 'Cleaning', 'Odds ratios'],
    rows: 70000,
    rowsLabel: '70,000',
    shape: '13 columns',
    summary:
      '70,000 patient rows with age, blood pressure, cholesterol, and a cardiovascular flag. Rectangular and simple, with a small set of impossible blood-pressure values you should remove and count.',
    fileNote: 'One row per exam. Check blood pressure before fitting.',
    split: {
      marker: 'Random cut',
      trainLabel: 'Fit',
      holdoutLabel: 'Check',
      trainShare: 70,
      caption: 'Stratified split',
    },
    signal: { interview: 7, research: 5, applied: 4 },
    sections: {
      models: sec('warn', 'Impossible pressures', [
        ['Clean, then logistic', 'Drop non-positive pressures and rows where systolic is below diastolic. Then fit cardio on age, pressure, cholesterol, and activity.'],
        ['Age in days', 'Age is stored in days. Convert to years for the write-up so a coefficient can be read.'],
        ['Shallow tree', 'Use it as a picture of thresholds on blood pressure, and check it against the logistic fit.'],
      ]),
      statistics: sec('good', 'Included', [
        ['How many rows you dropped', 'Report the count and share of impossible pressures. Hiding that filter changes the sample.'],
        ['Odds per 10 mmHg', 'Rescale systolic pressure so the odds ratio is per 10 units, and show the interval.'],
      ]),
      interviews: sec('good', 'Screen ready', [
        ['Data trust', 'How did you find impossible blood pressures without a medical textbook on hand?'],
        ['Units', 'Age in days will produce a tiny coefficient. How do you present it?'],
        ['Not a device', 'What claim would you refuse to make about a single patient?'],
      ]),
      research: sec('idle', 'Ideas', [
        ['Measurement error', 'A short note on how extreme, likely mistyped pressures would have pulled the systolic coefficient.'],
        ['Risk scores', 'Compare the logistic linear predictor with a points score a clinician could add up by hand.'],
      ]),
      applications: sec('warn', 'Not a diagnosis', [
        ['Population description', 'The honest use is describing how measured factors co-occur in this exam file.'],
        ['Form design', 'Which fields separate groups is a question about the questionnaire, not about treating a person.'],
      ]),
    },
  },
  {
    ref: 'shivam2503/diamonds',
    title: 'Diamonds',
    owner: 'ggplot2 diamonds',
    topic: 'Regression',
    tags: ['Hedonic', 'Log price', 'Ordinal', 'Collinearity'],
    rows: 53940,
    rowsLabel: '53,940',
    shape: '10 columns',
    summary:
      '53,940 diamonds with carat, cut, color, clarity, and price. Extremely clean, and the right table for a hedonic regression you can explain to a non-modeller.',
    fileNote: 'Complete price table. A few zero dimensions.',
    split: {
      marker: 'Random cut',
      trainLabel: 'Fit',
      holdoutLabel: 'Check',
      trainShare: 70,
      caption: 'Random holdout',
    },
    signal: { interview: 7, research: 6, applied: 6 },
    sections: {
      models: sec('good', 'Start here', [
        ['Log price on carat', 'Regress log price on carat, then add ordered cut, color, and clarity. Carat will dominate. That is the finding, not a failure.'],
        ['Drop x, y, z or carat', 'Length, width, and depth move with carat. Fit both versions and show the variance inflation, or the unstable coefficients.'],
        ['Zero dimensions', 'A few rows have a zero length or depth. Drop them and record the count.'],
      ]),
      statistics: sec('good', 'Included', [
        ['Ordinal coding', 'Treat cut, color, and clarity as ordered. Compare dummy coding with a single score and say what each assumes.'],
        ['Intervals on the premium', 'The coefficient on one clarity step, with an interval, is the sentence a buyer understands.'],
      ]),
      interviews: sec('good', 'Screen ready', [
        ['Collinearity', 'Why do carat and the millimeter measurements fight each other?'],
        ['Log price', 'How do you translate a coefficient back into a percent price difference?'],
        ['What you would not automate', 'A pricing model still needs a person on unusual stones. Where would you set that aside?'],
      ]),
      research: sec('idle', 'Ideas', [
        ['Hedonic prices', 'This is the teaching version of a hedonic price regression. Write it as attribute prices, not as a prediction contest.'],
        ['Nonlinearity in carat', 'Test a quadratic or a spline in carat. The market does not price weight in a straight line.'],
      ]),
      applications: sec('idle', 'In practice', [
        ['Retail price bands', 'Jewelers compare a stone with others of similar carat and grade. The regression is that comparison, written down.'],
        ['Catalog QA', 'Large residuals are listings to recheck, not automatic markdowns.'],
      ]),
    },
  },
  {
    ref: 'lakshmi25npathi/imdb-dataset-of-50k-movie-reviews',
    title: 'IMDB Movie Reviews',
    owner: 'IMDB',
    topic: 'Text',
    tags: ['Sentiment', 'TF-IDF', 'Balanced', 'Linear model'],
    rows: 50000,
    rowsLabel: '50,000',
    shape: '2 columns',
    summary:
      '50,000 movie reviews labeled positive or negative, evenly split. Two columns, no missing text. The right place to learn that a linear bag-of-words model is a serious baseline.',
    fileNote: 'review and sentiment. Balanced on purpose.',
    split: {
      marker: 'Random cut',
      trainLabel: 'Fit',
      holdoutLabel: 'Check',
      trainShare: 70,
      caption: 'Random document split',
    },
    signal: { interview: 8, research: 5, applied: 6 },
    sections: {
      models: sec('good', 'Start here', [
        ['TF-IDF logistic regression', 'This should land near the high 80s in accuracy. Report it before any neural model.'],
        ['Naive Bayes', 'Same features, second model. Compare calibration. Naive Bayes is often sharper and worse as a probability.'],
        ['Error reading', 'Read 30 false positives. Sarcasm and plot summaries that sound grim are the usual failures.'],
      ]),
      statistics: sec('good', 'Included', [
        ['Token log-odds', 'List the words with the strongest class log-odds. That list is the explanation.'],
        ['Length', 'Check whether review length differs by label. If it does, say whether the model is using length or words.'],
      ]),
      interviews: sec('good', 'Screen ready', [
        ['Why is this file kind?', 'The classes are balanced and the label is in the text. Which real review problems are less kind?'],
        ['Linear versus deep', 'What evidence would justify a heavier model on this exact table?'],
        ['Split unit', 'Why split reviews, not sentences from the same review, across train and test?'],
      ]),
      research: sec('idle', 'Ideas', [
        ['Lexicons', 'Compare a sentiment dictionary score with the learned TF-IDF weights on the same holdout.'],
        ['Spurious cues', 'Look for tokens that predict the label because of the dataset construction, such as rating phrases inside the text.'],
      ]),
      applications: sec('idle', 'In practice', [
        ['Review routing', 'A linear score is enough to queue angry reviews for a reply.'],
        ['Moderation assist', 'The same setup flags text for a person. It is a weak reason to hide a review automatically.'],
      ]),
    },
  },
  {
    ref: 'dgomonov/new-york-city-airbnb-open-data',
    title: 'NYC Airbnb Open Data',
    owner: 'Dgomonov',
    topic: 'Regression',
    tags: ['Price', 'Outliers', 'Neighborhood', 'Log price'],
    rows: 48895,
    rowsLabel: '48,895',
    shape: '16 columns',
    summary:
      '48,895 New York listings from 2019 with price, neighborhood, and room type. Clean enough to model in an afternoon, once a few absurd prices are set aside.',
    fileNote: 'One listing per row. Prices include zeros and extremes.',
    split: {
      marker: 'By borough',
      trainLabel: 'Four boroughs',
      holdoutLabel: 'One borough',
      trainShare: 78,
      caption: 'Hold out a borough',
    },
    signal: { interview: 7, research: 6, applied: 6 },
    sections: {
      models: sec('warn', 'Extreme prices', [
        ['Log price', 'Drop zero prices and a high cap you choose from the training rows only. Regress log price on neighborhood group, room type, and minimum nights.'],
        ['Neighborhood cardinality', 'The fine neighborhood field has many levels. Compare group-only versus a regularized neighborhood effect.'],
        ['Availability', 'If the question is price, availability can stay. If the question is whether a listing gets booked, this snapshot does not contain that outcome.'],
      ]),
      statistics: sec('good', 'Included', [
        ['Median by borough and room', 'A table of medians with counts will explain more than a leaderboard score.'],
        ['Reviews missing', 'reviews_per_month is missing when there are no reviews. That is a structural zero, not a value to impute from other listings.'],
      ]),
      interviews: sec('good', 'Screen ready', [
        ['Outlier rule', 'How do you set a price cap using only the training fold?'],
        ['What is a row?', 'A listing is not a booking. Which product questions can this file answer?'],
        ['Leakage via target encoding', 'If you encode neighborhood mean price, where must that mean be computed?'],
      ]),
      research: sec('idle', 'Ideas', [
        ['Short-term rentals', 'There is a real literature on listing density and rents. This file supports a descriptive 2019 snapshot, not a causal claim about housing supply.'],
        ['Spatial residuals', 'Map the price residuals inside Manhattan. Clusters are the next question.'],
      ]),
      applications: sec('idle', 'In practice', [
        ['Host pricing tools', 'Suggested ranges come from room type, location, and comps, with the host still choosing the price.'],
        ['Market reports', 'Borough and room-type medians are the chart a marketplace publishes.'],
      ]),
    },
  },
  {
    ref: 'selfishgene/historical-hourly-weather-data',
    title: 'Hourly Weather',
    owner: 'Historical hourly weather',
    topic: 'Time series',
    tags: ['Forecast', 'Seasonality', 'Fourier', 'Baseline'],
    rows: 45253,
    rowsLabel: '45,000',
    shape: '36 cities',
    summary:
      'Hourly weather for dozens of US and Canadian cities, about five years, in wide and tidy files. The project is a temperature forecast with a seasonal baseline you can beat honestly.',
    fileNote: 'Hourly rows. Use one city file first.',
    split: {
      marker: 'Last 60 days',
      trainLabel: 'History',
      holdoutLabel: 'Last 60 days',
      trainShare: 80,
      caption: 'Forecast the holdout',
    },
    signal: { interview: 7, research: 6, applied: 6 },
    sections: {
      models: sec('good', 'Start here', [
        ['Seasonal naive', 'Predict each hour with the value from 24 hours ago, and with the value from 7 days ago. Write down both errors.'],
        ['Fourier regression', 'Regress temperature on sine and cosine terms for hour-of-day and day-of-year. This is the statistical model to understand.'],
        ['One city, then many', 'Fit a single city until the residual plot looks seasonal. Only then pool cities, with a city effect.'],
      ]),
      statistics: sec('good', 'Included', [
        ['Residual seasonality', 'If the holdout error still has a daily shape, the model is unfinished.'],
        ['Intervals', 'A point forecast is not the product. Show a simple residual-based interval and say when it fails during a storm.'],
      ]),
      interviews: sec('good', 'Screen ready', [
        ['The baseline question', 'What does your model beat, and by how much, on a future window?'],
        ['Leakage', 'Why is a random hour split meaningless for a forecast?'],
        ['Feature timing', 'Which weather fields at hour t would you be allowed to use when forecasting hour t+24?'],
      ]),
      research: sec('idle', 'Ideas', [
        ['Forecast skill', 'Report skill against the seasonal naive, which is the usual way meteorological improvements are stated.'],
        ['City transfer', 'Train the seasonal shape on several cities and test on one held-out city.'],
      ]),
      applications: sec('idle', 'In practice', [
        ['Energy load', 'Temperature forecasts drive heating and cooling load. This file is the weather half of that problem.'],
        ['Staffing', 'Retail and logistics use the same hourly seasonal regression for demand, with weather as an add-on.'],
      ]),
    },
  },
  {
    ref: 'uciml/adult-census-income',
    title: 'Adult Census Income',
    owner: 'UCI',
    topic: 'Classification',
    tags: ['Income', 'Logistic', 'Weights', 'Fairness'],
    rows: 32561,
    rowsLabel: '32,561',
    shape: '15 columns',
    summary:
      '32,561 census rows labeled by whether income exceeds $50K. A complete, famous classification table, and a required conversation about weights and fields you should not deploy.',
    fileNote: 'Clean census extract. Question marks mark missing values.',
    split: {
      marker: 'Random cut',
      trainLabel: 'Fit',
      holdoutLabel: 'Check',
      trainShare: 70,
      caption: 'Stratified split',
    },
    signal: { interview: 8, research: 7, applied: 4 },
    sections: {
      models: sec('good', 'Start here', [
        ['Logistic regression', 'Predict income class from education, hours, occupation, and age. Education and education-num are the same fact. Keep one.'],
        ['Hold out fnlwgt', 'That column is a sampling weight, not a property of the person. Using it as a feature is a common mistake.'],
        ['Tree comparison', 'A shallow tree should tell the same education-and-hours story. If it does not, reconcile them.'],
      ]),
      statistics: sec('good', 'Included', [
        ['Weighted versus unweighted rate', 'The share over $50K changes if you apply fnlwgt. Say which one you are reporting.'],
        ['Odds ratios', 'Hours and education, with intervals, are the statistical result. The score is secondary.'],
      ]),
      interviews: sec('good', 'Screen ready', [
        ['Sampling weights', 'What is fnlwgt, and what goes wrong if you drop it into the feature matrix?'],
        ['Protected attributes', 'Race and sex are in the file. When is it legitimate to measure a gap, and when is it a bad model feature?'],
        ['Missing as a category', 'Occupation can be a question mark. Do you impute it or keep the level?'],
      ]),
      research: sec('idle', 'Ideas', [
        ['Benchmark history', 'Kohavi used this extract as a classifier benchmark. A modern note asks how much of the score is education and hours alone.'],
        ['Gap measurement', 'Measure error rates across groups on a model that did not receive those fields as inputs. Do not turn that into a lending rule.'],
      ]),
      applications: sec('warn', 'Do not deploy', [
        ['Teaching, not underwriting', 'This table is for learning logistic regression and measurement. It is a poor and dated basis for a credit or hiring decision.'],
        ['Survey method', 'The weight column is the piece that transfers to any real survey analysis.'],
      ]),
    },
  },
  {
    ref: 'uciml/default-of-credit-card-clients-dataset',
    title: 'Credit Card Default',
    owner: 'UCI',
    topic: 'Classification',
    tags: ['Default', 'Payments', 'Calibration', 'Credit'],
    rows: 30000,
    rowsLabel: '30,000',
    shape: '25 columns',
    summary:
      '30,000 Taiwanese credit-card clients with six months of payment history and a default flag. Clean, complete, and the right size for a credit-risk model you can fully audit.',
    fileNote: 'One client per row. Default rate is near 22%.',
    split: {
      marker: 'Random cut',
      trainLabel: 'Fit',
      holdoutLabel: 'Check',
      trainShare: 70,
      caption: 'Stratified split',
    },
    signal: { interview: 8, research: 6, applied: 7 },
    sections: {
      models: sec('good', 'Start here', [
        ['Logistic on payment status', 'Use limit, the PAY_ status codes, and bill amounts. The recent status codes carry most of the signal. Show a model with only those.'],
        ['Boosted tree', 'Compare log loss and calibration. A tree that wins accuracy but is badly calibrated is not ready for a limit decision.'],
        ['Operating point', 'Pick a recall that a review team could handle and report precision there, plus the share of clients flagged.'],
      ]),
      statistics: sec('good', 'Included', [
        ['Default rate', 'About 22% default. Put an interval on it, then break it out by the latest payment status.'],
        ['Bill versus payment', 'The difference between bill and payment is a behavior measure. Summarize it before you hide it inside a model.'],
      ]),
      interviews: sec('good', 'Screen ready', [
        ['What is default here?', 'Be ready to say it is a payment default on revolving credit, not a general moral label.'],
        ['Calibration', 'Why can two models with the same AUC imply different loss reserves?'],
        ['Feature timing', 'Which of these fields would exist on the day a limit is set for a new client?'],
      ]),
      research: sec('idle', 'Ideas', [
        ['Repayment trajectories', 'Cluster the six-month status paths and see whether the path, not only the latest month, changes the odds.'],
        ['Score stability', 'Refit on half the clients and compare coefficients on the payment-status dummies.'],
      ]),
      applications: sec('idle', 'In practice', [
        ['Limit reviews', 'Issuers rank existing accounts for a human review of limit changes. The score is an input to that review.'],
        ['Reserve planning', 'Calibrated default probabilities, not ranks, are what a finance team can turn into an expected loss.'],
      ]),
    },
  },
  {
    ref: 'nicapotato/womens-ecommerce-clothing-reviews',
    title: 'Clothing Reviews',
    owner: "Women's e-commerce reviews",
    topic: 'Text',
    tags: ['Reviews', 'Recommend', 'Text', 'Department'],
    rows: 23486,
    rowsLabel: '23,486',
    shape: '10 columns',
    summary:
      'About 23,000 clothing reviews with rating, a recommend flag, department, and the review text. A tidy multi-column text table for a first recommend/do-not-recommend model.',
    fileNote: 'Some review text is missing. Rating and recommend can disagree.',
    split: {
      marker: 'Random cut',
      trainLabel: 'Fit',
      holdoutLabel: 'Check',
      trainShare: 70,
      caption: 'Random review split',
    },
    signal: { interview: 6, research: 5, applied: 6 },
    sections: {
      models: sec('good', 'Start here', [
        ['Recommend flag from text', 'TF-IDF plus logistic regression on the review text, after dropping empty reviews. The recommend flag is the decision label.'],
        ['Department baseline', 'A model that only knows department and class name is the baseline the text model must beat.'],
        ['Rating versus recommend', 'Some high ratings are not recommended, and the reverse. Fit both targets and show where they disagree.'],
      ]),
      statistics: sec('good', 'Included', [
        ['Agreement table', 'Cross-tabulate rating and the recommend flag. That table defines the problem.'],
        ['Age distribution', 'Age is on the row. Report the recommend rate by age band carefully, and do not turn age into a targeting rule.'],
      ]),
      interviews: sec('good', 'Screen ready', [
        ['Two labels', 'When would you predict rating, and when the recommend flag?'],
        ['Empty text', 'What do you do with a rating and no review?'],
        ['Tabular plus text', 'How do you tell whether department is adding anything once the words are in the model?'],
      ]),
      research: sec('idle', 'Ideas', [
        ['Aspect words', 'Group high-weight tokens into fit, color, and quality. A small aspect note is more interesting than another classifier.'],
        ['Disagreement', 'Study the reviews where stars and the recommend flag conflict.'],
      ]),
      applications: sec('idle', 'In practice', [
        ['Product pages', 'Retailers surface reviews that mention fit and fabric, which is a text rank on top of this kind of table.'],
        ['Merch follow-up', 'A drop in recommend rate for one class name is a buying conversation.'],
      ]),
    },
  },
  {
    ref: 'harlfoxem/housesalesprediction',
    title: 'King County House Sales',
    owner: 'King County',
    topic: 'Regression',
    tags: ['Hedonic', 'Log price', 'Zip code', 'Sale date'],
    rows: 21613,
    rowsLabel: '21,613',
    shape: '21 columns',
    summary:
      '21,613 house sales in King County with price, size, condition, and location. A clean hedonic price table if you split by sale date and keep zip-code means inside the training window.',
    fileNote: 'One sale per row. Price is the target.',
    split: {
      marker: 'Later sales',
      trainLabel: 'Earlier sales',
      holdoutLabel: 'Latest',
      trainShare: 70,
      caption: 'Split on sale date',
    },
    signal: { interview: 8, research: 6, applied: 7 },
    sections: {
      models: sec('warn', 'Zip means leak', [
        ['Log price', 'Regress log price on bedrooms, living area, grade, waterfront, and latitude. Grade is an assessment quality score. Say what it is.'],
        ['Zip encoding', 'If you add mean price by zip, compute that mean on training sales only. A full-sample zip mean is target leakage.'],
        ['Tree check', 'A tree will find waterfront and view. Compare median absolute percent error with the linear model.'],
      ]),
      statistics: sec('good', 'Included', [
        ['Price per square foot', 'Show the distribution and a map-like latitude band. This is the descriptive result.'],
        ['Grade and condition', 'These are ordered assessments. Report price gradients across them with counts.'],
      ]),
      interviews: sec('good', 'Screen ready', [
        ['Target encoding', 'Walk through a leaky zip-code feature and the fix. Interviewers ask this with housing data constantly.'],
        ['Log price', 'A coefficient of 0.1 means what percent, approximately?'],
        ['Time', 'Why split on the sale date even though the file covers only about a year?'],
      ]),
      research: sec('idle', 'Ideas', [
        ['Hedonic index', 'A repeat-sales or grade-adjusted price index over the months in the file is a small research piece.'],
        ['Spatial correlation', 'Map residuals. If neighbors share a residual, a plain random split was optimistic. Pace and Barry is the related classic on the California file.'],
      ]),
      applications: sec('idle', 'In practice', [
        ['Appraisal support', 'A comparable-sales adjustment for size, grade, and waterfront is how simple appraisal models are explained.'],
        ['Listing QA', 'Large residuals are listings or records to recheck, not automatic prices.'],
      ]),
    },
  },
  {
    ref: 'camnugent/california-housing-prices',
    title: 'California Housing',
    owner: 'Pace and Barry',
    topic: 'Regression',
    tags: ['Hedonic', 'Censoring', 'Spatial', 'Log price'],
    rows: 20640,
    rowsLabel: '20,640',
    shape: '10 columns',
    summary:
      '20,640 California census block groups with median house value, income, and location. Small, complete, and full of interview traps: the value is capped, and the row is a block, not a house.',
    fileNote: 'Block groups. Values cap near $500,001.',
    split: {
      marker: 'By county band',
      trainLabel: 'Most blocks',
      holdoutLabel: 'Held latitude',
      trainShare: 75,
      caption: 'Spatial holdout',
    },
    signal: { interview: 8, research: 7, applied: 5 },
    sections: {
      models: sec('warn', 'Capped target', [
        ['Log median value', 'Linear regression on median income, housing age, rooms, and ocean proximity. Then plot residuals against latitude and longitude.'],
        ['The cap', 'Values stack at 500,001. Report error with and without those rows, and say the target is censored.'],
        ['Income only', 'Median income alone is a fierce baseline. Show how little the other fields add.'],
      ]),
      statistics: sec('good', 'Included', [
        ['Ecological unit', 'Every feature is a block-group median or count. Do not describe a coefficient as the effect for a household.'],
        ['Spatial residual', 'A scatter of residual versus latitude is the picture that justifies a spatial discussion.'],
      ]),
      interviews: sec('good', 'Screen ready', [
        ['Censoring', 'What does a pile of identical high values do to RMSE?'],
        ['Ecological fallacy', 'Why is a block-group model not a model of a buyer?'],
        ['Scaling of income', 'Median income in this file is on a scaled unit. How do you avoid misreading the coefficient?'],
      ]),
      research: sec('idle', 'Ideas', [
        ['Spatial autoregression', 'Pace and Barry, 1997, used this data to discuss spatial dependence. A replication of the residual correlation is a real project.'],
        ['Censoring model', 'A Tobit-style note on the upper cap, compared with simply dropping capped rows.'],
      ]),
      applications: sec('idle', 'In practice', [
        ['Market description', 'Agencies describe area values from census aggregates. That is the job this table supports.'],
        ['Model cards', 'The cap and the block-group unit belong on any card that reports an error number from this file.'],
      ]),
    },
  },
  {
    ref: 'neuromusic/avocado-prices',
    title: 'Avocado Prices',
    owner: 'Hass Avocado Board',
    topic: 'Time series',
    tags: ['Panel', 'Seasonality', 'Fixed effects', 'Price'],
    rows: 18249,
    rowsLabel: '18,249',
    shape: '13 columns',
    summary:
      'Weekly avocado prices and volumes by US region and by conventional versus organic. A clean panel: the row is a region-week, not an independent shopper.',
    fileNote: 'Weekly panel. Type and region identify a series.',
    split: {
      marker: 'Last 16 weeks',
      trainLabel: 'History',
      holdoutLabel: 'Latest',
      trainShare: 78,
      caption: 'Forecast the last weeks',
    },
    signal: { interview: 7, research: 6, applied: 6 },
    sections: {
      models: sec('good', 'Start here', [
        ['Region and type effects', 'Regress average price on organic versus conventional, with a region fixed effect and a week trend or month dummies.'],
        ['Seasonal naive', 'For one region, forecast next week with the same week last year. The regression should beat that, or you should say it does not.'],
        ['Volume and price', 'Volume and price are simultaneous. Do not call a volume coefficient a demand elasticity without an instrument or a disclaimer.'],
      ]),
      statistics: sec('warn', 'Not iid rows', [
        ['Panel structure', 'Errors in the same region are correlated. Cluster standard errors by region, or the intervals will look too tight.'],
        ['Organic premium', 'The organic coefficient, with a clustered interval, is the number to publish.'],
      ]),
      interviews: sec('good', 'Screen ready', [
        ['What is a row?', 'Why are 18,000 rows not 18,000 independent observations?'],
        ['Random split', 'What goes wrong if next week of California is in train and this week is in test?'],
        ['Causality', 'Can you claim that a volume spike caused a price drop from this file alone?'],
      ]),
      research: sec('idle', 'Ideas', [
        ['Price transmission', 'Ask whether the organic premium is stable across regions or widens in some seasons.'],
        ['Forecast comparison', 'A short note comparing region fixed effects with a per-region seasonal naive.'],
      ]),
      applications: sec('idle', 'In practice', [
        ['Grocery planning', 'Buyers watch regional weekly prices and the organic gap to time promotions.'],
        ['Reporting', 'The seasonal chart by type is the artifact, and the model is there to put an interval on the gap.'],
      ]),
    },
  },
  {
    ref: 'lakshmi25npathi/bike-sharing-dataset',
    title: 'Bike Sharing',
    owner: 'Capital Bikeshare',
    topic: 'Time series',
    tags: ['Demand', 'Hourly', 'Leakage', 'Weather'],
    rows: 17379,
    rowsLabel: '17,379',
    shape: '17 columns',
    summary:
      'Two years of hourly Capital Bikeshare counts with weather and calendar fields. Use the hourly file. Do not predict total count from the casual and registered columns that add up to it.',
    fileNote: 'hour.csv has the volume. day.csv is the rollup.',
    split: {
      marker: 'Last 21 days',
      trainLabel: 'History',
      holdoutLabel: 'Last 21 days',
      trainShare: 80,
      caption: 'Forecast the last weeks',
    },
    signal: { interview: 8, research: 5, applied: 7 },
    sections: {
      models: sec('warn', 'Casual + registered', [
        ['Hour and weather', 'Predict cnt from hour, working day, temperature, and weather situation. Leave casual and registered out. They sum to cnt.'],
        ['Linear vs tree', 'A regression with hour dummies is the baseline. A tree should capture the commute peaks. Compare them on the last three weeks.'],
        ['Daily rollup', 'Repeat the forecast on day.csv so you can talk about when aggregation helps.'],
      ]),
      statistics: sec('good', 'Included', [
        ['Commute shape', 'Plot mean count by hour for working days and weekends. That chart is the model in picture form.'],
        ['Weather bins', 'Mean count by weather situation, with sample sizes. Light rain days are rare, so the interval matters.'],
      ]),
      interviews: sec('good', 'Screen ready', [
        ['The sum leak', 'Why is a model that uses casual and registered invalid?'],
        ['Time features', 'Which of season, month, and hour are redundant?'],
        ['Metric', 'Would you rather be wrong by 20 bikes at 3am or at 8am? Does RMSE know that?'],
      ]),
      research: sec('idle', 'Ideas', [
        ['Weather response', 'Estimate the temperature curve separately for commute hours and midday.'],
        ['Holiday shift', 'Test whether a working-day model mis-forecasts the holidays in the holdout.'],
      ]),
      applications: sec('idle', 'In practice', [
        ['Rebalancing', 'Operators move bikes toward stations before commute peaks. An hourly forecast is the input.'],
        ['Staffing docks', 'The same curve decides when a van route is worth running.'],
      ]),
    },
  },
  {
    ref: 'janiobachmann/bank-marketing-dataset',
    title: 'Bank Marketing',
    owner: 'UCI',
    topic: 'Classification',
    tags: ['Campaigns', 'Duration', 'Imbalance', 'Uplift'],
    rows: 11162,
    rowsLabel: '11,162',
    shape: '17 columns',
    summary:
      'A cleaned bank telemarketing table: client traits, campaign history, and whether the client subscribed. Compact, complete, and the usual place to learn that call duration leaks the outcome.',
    fileNote: 'Cleaned campaign rows. Duration is known after the call.',
    split: {
      marker: 'Later contacts',
      trainLabel: 'Earlier',
      holdoutLabel: 'Latest',
      trainShare: 70,
      caption: 'Split on campaign month',
    },
    signal: { interview: 8, research: 6, applied: 7 },
    sections: {
      models: sec('warn', 'Drop duration', [
        ['Subscription model', 'Predict the deposit from job, balance, housing loan, contact type, and previous campaign outcome. Drop duration. It is how long the call already lasted.'],
        ['With and without duration', 'Fit both and show the jump in AUC. That jump is the interview answer, not a result to ship.'],
        ['Class balance', 'Subscribers are the minority. Report precision at the top 10% of scores, which is a call list a team could actually dial.'],
      ]),
      statistics: sec('good', 'Included', [
        ['Subscription rate', 'Overall rate, then by previous outcome and by month. Month effects can be campaign mix, not season magic.'],
        ['Previous outcome', 'A prior success is a strong, legitimate feature. Show the rate table so the model is not a black box around one cell.'],
      ]),
      interviews: sec('good', 'Screen ready', [
        ['Duration', 'Why is call duration leakage, and why do tutorials still include it?'],
        ['Who do you call?', 'Given a budget of 200 calls, how do you use the score?'],
        ['Uplift', 'This file records who was called, not a randomized control. What can you not claim?'],
      ]),
      research: sec('idle', 'Ideas', [
        ['Uplift caution', 'A short note on why response models are not uplift models when almost everyone in the file was contacted.'],
        ['Month confounding', 'Ask whether month still predicts after you account for contact type and campaign intensity.'],
      ]),
      applications: sec('idle', 'In practice', [
        ['Call lists', 'Banks rank clients for the next campaign from history, then cap the list by agent hours.'],
        ['Script tests', 'A real uplift test needs a held-out group that is not called. This file can motivate that design. It is not that design.'],
      ]),
    },
  },
  {
    ref: 'blastchar/telco-customer-churn',
    title: 'Telco Customer Churn',
    owner: 'IBM Telco',
    topic: 'Classification',
    tags: ['Churn', 'Contract', 'Calibration', 'Retention'],
    rows: 7043,
    rowsLabel: '7,043',
    shape: '21 columns',
    summary:
      '7,043 telecom customers with contract, tenure, monthly charges, and a churn flag. Small, very clean, and still the table interviewers expect you to reason about.',
    fileNote: 'One customer per row. TotalCharges is blank for new accounts.',
    split: {
      marker: 'Random cut',
      trainLabel: 'Fit',
      holdoutLabel: 'Check',
      trainShare: 70,
      caption: 'Stratified split',
    },
    signal: { interview: 8, research: 4, applied: 7 },
    sections: {
      models: sec('good', 'Start here', [
        ['Logistic regression', 'Churn on contract type, tenure, monthly charges, and internet service. Month-to-month and short tenure will dominate.'],
        ['TotalCharges parsing', 'The field arrives as text and is blank when tenure is zero. Coerce it and check those rows rather than dropping them silently.'],
        ['Tree picture', 'A shallow tree is the slide. The logistic model is the probability you would actually threshold.'],
      ]),
      statistics: sec('good', 'Included', [
        ['Churn by contract', 'Rates and counts for month-to-month, one year, and two years. This table may be the whole analysis.'],
        ['Tenure curve', 'Churn rate by tenure band, with intervals. The curve falls quickly and then flattens.'],
      ]),
      interviews: sec('good', 'Screen ready', [
        ['What would you do?', 'A high score is not a reason to discount everyone. What offer would you test, and on whom?'],
        ['Blank charges', 'Why are brand-new customers missing total charges?'],
        ['Metric', 'If you can only call 10% of the base, which metric do you optimize?'],
      ]),
      research: sec('idle', 'Ideas', [
        ['Survival view', 'Tenure among customers still active is censored. A survival curve is a better research frame than a single churn flag.'],
        ['Offer test', 'Design the randomized retention test this observational file cannot replace.'],
      ]),
      applications: sec('idle', 'In practice', [
        ['Save desk', 'Teams queue likely churners for a call. Contract type already does a lot of that sorting.'],
        ['Plan design', 'The contract table is evidence for pushing annual plans, which you would then test.'],
      ]),
    },
  },
  {
    ref: 'yasserh/walmart-dataset',
    title: 'Walmart Weekly Sales',
    owner: 'Walmart',
    topic: 'Time series',
    tags: ['Forecast', 'Holidays', 'Stores', 'Panel'],
    rows: 6435,
    rowsLabel: '6,435',
    shape: '8 columns',
    summary:
      'Weekly sales for 45 Walmart stores, with holiday flags, temperature, fuel, and unemployment. Small but unusually clean, and the right panel for a first retail forecast.',
    fileNote: 'Store-week rows. Holidays are marked.',
    split: {
      marker: 'Last 12 weeks',
      trainLabel: 'History',
      holdoutLabel: 'Last 12 weeks',
      trainShare: 78,
      caption: 'Forecast the last quarter',
    },
    signal: { interview: 7, research: 5, applied: 7 },
    sections: {
      models: sec('good', 'Start here', [
        ['Store effects plus holiday', 'Regress weekly sales on store, a holiday flag, and week-of-year. That is the baseline forecast.'],
        ['Same week last year', 'A seasonal naive by store is the number to beat on the last 12 weeks.'],
        ['Macro add-ons', 'Add fuel, CPI, and unemployment only after the seasonal model is in place, and check that they help the holdout rather than just the fit.'],
      ]),
      statistics: sec('good', 'Included', [
        ['Holiday lift', 'Mean sales on holiday weeks versus other weeks, by store size. Report the interval.'],
        ['Store scale', 'Stores differ by a lot. An unweighted error lets the biggest stores decide the score.'],
      ]),
      interviews: sec('good', 'Screen ready', [
        ['Panel forecast', 'How do you stop a random split from putting next week in train and this week in test?'],
        ['Holiday flag', 'Why is a holiday dummy not the same thing as a Thanksgiving effect?'],
        ['Error weighting', 'Do you care equally about a small store and a large one?'],
      ]),
      research: sec('idle', 'Ideas', [
        ['Holiday heterogeneity', 'Estimate a separate holiday lift for the largest and smallest stores.'],
        ['Macro or season', 'Show how much of the fuel or CPI coefficient disappears once week-of-year is included.'],
      ]),
      applications: sec('idle', 'In practice', [
        ['Store labor and inventory', 'Weekly forecasts by store are how labor plans and warehouse pushes get checked.'],
        ['Holiday playbooks', 'The holiday lift table is the operations artifact. The model is there to see if weather or fuel changes it.'],
      ]),
    },
  },
  {
    ref: 'uciml/sms-spam-collection-dataset',
    title: 'SMS Spam Collection',
    owner: 'UCI',
    topic: 'Text',
    tags: ['Spam', 'TF-IDF', 'Imbalance', 'Naive Bayes'],
    rows: 5574,
    rowsLabel: '5,574',
    shape: '2 columns',
    summary:
      '5,574 SMS messages labeled ham or spam. Small, carefully labeled, and still the cleanest text table for a first spam filter you can explain word by word.',
    fileNote: 'Label and message. Extra empty columns can be ignored.',
    split: {
      marker: 'Random cut',
      trainLabel: 'Fit',
      holdoutLabel: 'Check',
      trainShare: 70,
      caption: 'Stratified message split',
    },
    signal: { interview: 8, research: 4, applied: 6 },
    sections: {
      models: sec('good', 'Start here', [
        ['Naive Bayes', 'Multinomial naive Bayes on word counts is the classic fit. Compare it with a TF-IDF logistic regression.'],
        ['Class weights', 'Spam is the minority. Report precision and recall for spam, plus the false-alarm rate on ham. Accuracy will look high either way.'],
        ['Token list', 'Publish the tokens with the highest spam log-odds. If they are only "prize" and "claim", say how brittle that is.'],
      ]),
      statistics: sec('good', 'Included', [
        ['Base rate', 'Compute the spam share and an interval. Then give precision at that base rate so the score has a denominator.'],
        ['Message length', 'Spam and ham differ in length. Check a length-only baseline so the words have to earn their keep.'],
      ]),
      interviews: sec('good', 'Screen ready', [
        ['False alarms', 'What is worse, marking a real message as spam or missing a spam text? How does that choose the threshold?'],
        ['Tiny test set', 'With a few thousand rows, how wide is the interval on precision?'],
        ['New tricks', 'Why will the token list from 2012 fail on a new scam wording?'],
      ]),
      research: sec('idle', 'Ideas', [
        ['Calibration of naive Bayes', 'A short comparison of naive Bayes probabilities versus logistic probabilities on the same tokens.'],
        ['Robustness', 'Hold out every message containing a particular token family and see what remains.'],
      ]),
      applications: sec('idle', 'In practice', [
        ['Inbox filters', 'Carriers and mail apps still combine a simple token model with a blocklist and a way for the user to correct it.'],
        ['Review queue', 'Low-precision spam scores are fine if a person sees the message before it is dropped.'],
      ]),
    },
  },
  {
    ref: 'arnabchaki/data-science-salaries-2023',
    title: 'Data Science Salaries 2023',
    owner: 'Data science salaries',
    topic: 'Regression',
    tags: ['Pay', 'Log salary', 'Remote', 'Levels'],
    rows: 3755,
    rowsLabel: '3,755',
    shape: '11 columns',
    summary:
      'A few thousand data-role salaries, already converted to USD, with level, employment type, remote ratio, and company size. Small on purpose. Use it to practice pay questions without pretending the sample is the market.',
    fileNote: 'Reported salaries. Not a random sample of the market.',
    split: {
      marker: 'Random cut',
      trainLabel: 'Fit',
      holdoutLabel: 'Check',
      trainShare: 70,
      caption: 'Random holdout',
    },
    signal: { interview: 8, research: 5, applied: 6 },
    sections: {
      models: sec('warn', 'Not causal', [
        ['Log salary', 'Regress log salary in USD on experience level, employment type, and company size. Group rare job titles before you give each one a coefficient.'],
        ['Remote ratio', 'Add remote ratio only with country or residence in the model. Otherwise the remote coefficient absorbs geography.'],
        ['Median baseline', 'The median by experience level is the baseline. A model that barely beats it does not deserve a complicated story.'],
      ]),
      statistics: sec('good', 'Included', [
        ['Level medians', 'Median and interquartile range by experience level and company size. That table is the analysis.'],
        ['Sample bias', 'Say who is likely missing: contractors, non-English posters, and roles that do not show up in public spreadsheets.'],
      ]),
      interviews: sec('good', 'Screen ready', [
        ['How would you set a band?', 'Talk through level, location, and sample size. This is the compensation question in data interviews.'],
        ['Confounding', 'Why is a raw remote-versus-office gap not a remote premium?'],
        ['Small n', 'What would you refuse to conclude about a job title with 12 rows?'],
      ]),
      research: sec('idle', 'Ideas', [
        ['Remote gap', 'Estimate the remote coefficient after level and residence controls, and discuss selection into remote work.'],
        ['Title collapse', 'Compare a model with raw titles against one with a hand-built family such as analyst, scientist, and engineer.'],
      ]),
      applications: sec('idle', 'In practice', [
        ['Offer bands', 'Recruiting teams start from level medians, then adjust for location. This file is a public sketch of that spreadsheet.'],
        ['Market briefs', 'The honest product is a table with sample sizes, not a salary a candidate should expect.'],
      ]),
    },
  },
  {
    ref: 'unsdsn/world-happiness',
    title: 'World Happiness',
    owner: 'World Happiness Report',
    topic: 'Regression',
    tags: ['Inference', 'Small n', 'Coefficients', 'Not causal'],
    rows: 156,
    rowsLabel: '156',
    shape: '9 columns',
    summary:
      'A country-level happiness table, about 156 countries in a recent year, with GDP, support, health, freedom, and trust sitting next to a life-evaluation score. This one is for inference, not for a prediction contest.',
    fileNote: 'One country per row. Other years are in the same dataset.',
    split: {
      marker: 'Leave-one-out',
      trainLabel: 'Most countries',
      holdoutLabel: 'Held out',
      trainShare: 85,
      caption: 'Explain, do not forecast',
    },
    signal: { interview: 7, research: 7, applied: 4 },
    sections: {
      models: sec('warn', 'Not causal', [
        ['Linear life evaluation', 'Regress the ladder score on log GDP, social support, healthy life expectancy, freedom, generosity, and corruption perceptions. Report coefficients and intervals, not a test-set R-squared as the point.'],
        ['VIF check', 'GDP and life expectancy move together. Show variance inflation or a model that drops one of them.'],
        ['Year comparison', 'Repeat the fit on an earlier year in the same dataset and see which coefficients move.'],
      ]),
      statistics: sec('good', 'Included', [
        ['n is the number of countries', 'Residuals are countries, not people. An impressive R-squared on 156 rows is still a small sample.'],
        ['Influence', 'A couple of countries can tilt generosity or corruption. A leave-one-out or Cook-style check belongs in the notebook.'],
      ]),
      interviews: sec('good', 'Screen ready', [
        ['Prediction versus explanation', 'Why is a high R-squared not a reason to say GDP causes happiness?'],
        ['Unit of analysis', 'What would be different if you had people instead of countries?'],
        ['Collinearity', 'How do you talk about two coefficients that trade off when both variables are in the model?'],
      ]),
      research: sec('idle', 'Ideas', [
        ['Report methodology', 'Read how the World Happiness Report builds the ladder score, and write what the regression does and does not add.'],
        ['Specification curve', 'Show the GDP coefficient across a handful of reasonable control sets rather than one preferred model.'],
      ]),
      applications: sec('warn', 'Do not rank policy', [
        ['Description', 'Governments and NGOs cite these tables. The responsible use is description with the survey method attached.'],
        ['What not to ship', 'A model that tells a country which coefficient to "improve" next is beyond what this file can support.'],
      ]),
    },
  },
]
