---
title: Data Access - PeekbankR
description: A guide on how to acces peekbank data using peekbankr.
---

The `peekbankr` package provides easy access to the peekbank database from R without writing SQL queries.

## Installation

`devtools` is required to install `peekbankr`, so install it using
```r
install.packages("devtools")
```

Some setups require a manual installation of `RMariaDB`, install is using:

```r
install.packages("RMariaDB")
```

You can then install `peekbankr` using

```r
devtools::install_github("peekbank/peekbankr")
```




## Basic Usage

`peekbankr` offers a range of `get_` functions to pull data into your environment, for example:

```r
library(peekbankr)

datasets <- get_datasets()
head(datasets)

range_admins <- get_administrations(age = c(24, 36))
head(range_admins)

pomper_admins <- get_administrations(dataset_name = "pomper_saffran_2016")
```

Refer to the [Data Schema](../../peekbank/dataschema/) to learn more about the shape of the resulting data.

## Quick Analysis Example

```r
library(dplyr)

aoi_data <- get_aoi_timepoints(dataset_name = "pomper_saffran_2016")

target_looks <- aoi_data %>%
  group_by(t_norm) %>%
  summarise(prop_target = mean(aoi == "target", na.rm = TRUE), .groups = "drop")

library(ggplot2)
ggplot(target_looks, aes(x = t_norm, y = prop_target)) +
  geom_line() +
  labs(x = "Time (ms)", y = "Proportion target", title = "Target looking")
```

## Full documentation

<iframe class="w-full" src="https://peekbank.github.io/peekbankr/articles/peekbankr.html" style="border:none; min-height: 800px;"></iframe>