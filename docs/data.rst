=============
Template Data
=============

The simulation of the following foreground components requires specific
template map(s) and/or observational/simulation catalog(s) as the input:

* ``galactic/synchrotron``:
  requires the Haslam 408 MHz survey as the template map, and the
  spectral index map.
* ``galactic/freefree``:
  requires the Hα map and the dust map.
* ``galactic/snr``:
  requires the catalog of the Galactic SNRs.

The above all-sky maps are in HEALPix format.
Sky patches can be cut out from them using the ``get-healpix-patch`` tool.
Data can be downloaded via the instruction of the `Data repo<https://github.com/Fg21Sim/Data>`_.
