#!/usr/bin/env node

import yargs from "yargs";
import {hideBin} from 'yargs/helpers';
import {buildDir, cut} from "./index.js";

yargs(hideBin(process.argv))
    .command({
        command: 'cut [file] [output]',
        builder: yargs => yargs
            .option('start', {
                alias: 's',
                requiresArg: true
            })
            .option('end', {
                alias: 'e',
                requiresArg: true
            }),
        handler: cut
    })
    .command({
        command: 'builddir [dir] [output]',
        builder: yargs => yargs.option('extension', {
            alias: 'ext',
            requiresArg: true
        }),
        handler: buildDir
    })
    .help()
    .parse()
