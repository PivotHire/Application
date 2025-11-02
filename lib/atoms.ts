import {atom} from "jotai/index";
import {atomWithStorage} from "jotai/utils";

export const accountIdentityAtom = atomWithStorage("accountIdentity", "Talent");
export const accountTypeAtom = atom(0);