#!/usr/bin/env node

import { runKpaCheck } from './index.js';

process.exitCode = runKpaCheck(process.argv.slice(2));
