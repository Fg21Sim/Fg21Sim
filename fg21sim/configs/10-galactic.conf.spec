# Configurations for "fg21sim"
# -*- mode: conf -*-
#
# Syntax: `ConfigObj`, https://github.com/DiffSK/configobj
#
# This file contains the general configurations, which control the general
# behaviors, or will be used in other configuration sections.


[galactic]

  # Synchrotron emission component (unpolarized)
  [[synchrotron]]
  # The template map for the simulation.
  # This config specify the relative path to the template from "data_dir".
  template = string(default=None)
  # The frequency of the template map
  template_freq = float(default=None)
  # The unit of the template map pixel
  template_unit = string(default=None)

  # Whether add fluctuations on the small scales
  add_smallscales = boolean(default=True)

  # Filename prefix for this component
  prefix = string(default="gsync")
  # Whether save this component to disk
  save = boolean(default=True)
  # Output directory to save the simulated results
  output_dir = string(default="")
