"use client";

import styles from "@/app/styles/talentProfile.module.scss";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import Link from "next/link";
import {Button} from "@/components/ui/button";
import {CalendarIcon, Check, ChevronsUpDown, Loader2, Trash2} from "lucide-react";
import React, {useEffect, useState} from "react";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Skeleton} from "@/components/ui/skeleton";
import {Textarea} from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {cn} from "@/lib/utils";
import {Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList} from "@/components/ui/command";
import {Separator} from "@/components/ui/separator";
import {MonthPicker} from "@/components/ui/monthpicker";
import {format} from "date-fns/format";

type EducationEntry = {
    id: string;
    degreeLevel: 'Bachelor' | 'Master' | 'Doctorate' | 'Other' | '';
    school: string;
    major: string;
    startDate: string;
    endDate: string;
};

export function TalentProfileForm() { // headline, bio, location, languages, years of exp, available time, work hours typ, work hours max, salary min, salary max, salary currency, education, portfolio, remarks

    const [headline, setHeadline] = useState("");
    const [bio, setBio] = useState("");
    const [location, setLocation] = useState("");
    const [languages, setLanguages] = useState("");
    const [yearsOfExperience, setYearsOfExperience] = useState<number | null>(null);
    const [availability, setAvailability] = useState("");
    const [workHoursTypical, setWorkHoursTypical] = useState<number | null>(null);
    const [workHoursMax, setWorkHoursMax] = useState<number | null>(null);
    const [salaryMin, setSalaryMin] = useState<number | null>(null);
    const [salaryMax, setSalaryMax] = useState<number | null>(null);
    const [salaryCurrency, setSalaryCurrency] = useState("");
    const [education, setEducation] = useState("");
    const [portfolio, setPortfolio] = useState("");
    const [remarks, setRemarks] = useState("");

    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        alert("Submitted!");
        setTimeout(() => setIsSubmitting(false), 1000);
    }

    const locationList = [
        {label: "Afghanistan", value: "afghanistan"},
        {label: "Åland Islands", value: "aland islands"},
        {label: "Albania", value: "albania"},
        {label: "Algeria", value: "algeria"},
        {label: "American Samoa", value: "american samoa"},
        {label: "Andorra", value: "andorra"},
        {label: "Angola", value: "angola"},
        {label: "Anguilla", value: "anguilla"},
        {label: "Antarctica", value: "antarctica"},
        {label: "Antigua and Barbuda", value: "antigua and barbuda"},
        {label: "Argentina", value: "argentina"},
        {label: "Armenia", value: "armenia"},
        {label: "Aruba", value: "aruba"},
        {label: "Australia", value: "australia"},
        {label: "Austria", value: "austria"},
        {label: "Azerbaijan", value: "azerbaijan"},
        {label: "Bahamas", value: "bahamas"},
        {label: "Bahrain", value: "bahrain"},
        {label: "Bangladesh", value: "bangladesh"},
        {label: "Barbados", value: "barbados"},
        {label: "Belarus", value: "belarus"},
        {label: "Belgium", value: "belgium"},
        {label: "Belize", value: "belize"},
        {label: "Benin", value: "benin"},
        {label: "Bermuda", value: "bermuda"},
        {label: "Bhutan", value: "bhutan"},
        {label: "Bolivia", value: "bolivia"},
        {label: "Bosnia and Herzegovina", value: "bosnia and herzegovina"},
        {label: "Botswana", value: "botswana"},
        {label: "Bouvet Island", value: "bouvet island"},
        {label: "Brazil", value: "brazil"},
        {label: "British Virgin Islands", value: "british virgin islands"},
        {label: "Brunei", value: "brunei"},
        {label: "Bulgaria", value: "bulgaria"},
        {label: "Burkina Faso", value: "burkina faso"},
        {label: "Burundi", value: "burundi"},
        {label: "Cabo Verde", value: "cabo verde"},
        {label: "Cambodia", value: "cambodia"},
        {label: "Cameroon", value: "cameroon"},
        {label: "Canada", value: "canada"},
        {label: "Cayman Islands", value: "cayman islands"},
        {label: "Central African Republic", value: "central african republic"},
        {label: "Chad", value: "chad"},
        {label: "Chile", value: "chile"},
        {label: "China", value: "china"},
        {label: "Colombia", value: "colombia"},
        {label: "Comoros", value: "comoros"},
        {label: "Congo (Congo-Brazzaville)", value: "congo (congo-brazzaville)"},
        {label: "Congo (Congo-Kinshasa)", value: "congo (congo-kinshasa)"},
        {label: "Cook Islands", value: "cook islands"},
        {label: "Costa Rica", value: "costa rica"},
        {label: "Côte d'Ivoire", value: "cote d'ivoire"},
        {label: "Croatia", value: "croatia"},
        {label: "Cuba", value: "cuba"},
        {label: "Curaçao", value: "curacao"},
        {label: "Cyprus", value: "cyprus"},
        {label: "Czechia", value: "czechia"},
        {label: "Denmark", value: "denmark"},
        {label: "Djibouti", value: "djibouti"},
        {label: "Dominica", value: "dominica"},
        {label: "Dominican Republic", value: "dominican republic"},
        {label: "Ecuador", value: "ecuador"},
        {label: "Egypt", value: "egypt"},
        {label: "El Salvador", value: "el salvador"},
        {label: "Equatorial Guinea", value: "equatorial guinea"},
        {label: "Eritrea", value: "eritrea"},
        {label: "Estonia", value: "estonia"},
        {label: "Eswatini", value: "eswatini"},
        {label: "Ethiopia", value: "ethiopia"},
        {label: "Falkland Islands (Islas Malvinas)", value: "falkland islands (islas malvinas)"},
        {label: "Faroe Islands", value: "faroe islands"},
        {label: "Fiji", value: "fiji"},
        {label: "Finland", value: "finland"},
        {label: "France", value: "france"},
        {label: "French Guiana", value: "french guiana"},
        {label: "French Polynesia", value: "french polynesia"},
        {label: "French Southern Territories", value: "french southern territories"},
        {label: "Gabon", value: "gabon"},
        {label: "Gambia", value: "gambia"},
        {label: "Georgia", value: "georgia"},
        {label: "Germany", value: "germany"},
        {label: "Ghana", value: "ghana"},
        {label: "Gibraltar", value: "gibraltar"},
        {label: "Greece", value: "greece"},
        {label: "Greenland", value: "greenland"},
        {label: "Grenada", value: "grenada"},
        {label: "Guadeloupe", value: "guadeloupe"},
        {label: "Guam", value: "guam"},
        {label: "Guatemala", value: "guatemala"},
        {label: "Guernsey", value: "guernsey"},
        {label: "Guinea", value: "guinea"},
        {label: "Guinea-Bissau", value: "guinea-bissau"},
        {label: "Guyana", value: "guyana"},
        {label: "Haiti", value: "haiti"},
        {label: "Heard Island and McDonald Islands", value: "heard island and mcdonald islands"},
        {label: "Honduras", value: "honduras"},
        {label: "Hong Kong", value: "hong kong"},
        {label: "Hungary", value: "hungary"},
        {label: "Iceland", value: "iceland"},
        {label: "India", value: "india"},
        {label: "Indonesia", value: "indonesia"},
        {label: "Iran", value: "iran"},
        {label: "Iraq", value: "iraq"},
        {label: "Ireland", value: "ireland"},
        {label: "Isle of Man", value: "isle of man"},
        {label: "Israel", value: "israel"},
        {label: "Italy", value: "italy"},
        {label: "Jamaica", value: "jamaica"},
        {label: "Japan", value: "japan"},
        {label: "Jersey", value: "jersey"},
        {label: "Jordan", value: "jordan"},
        {label: "Kazakhstan", value: "kazakhstan"},
        {label: "Kenya", value: "kenya"},
        {label: "Kiribati", value: "kiribati"},
        {label: "Kosovo", value: "kosovo"},
        {label: "Kuwait", value: "kuwait"},
        {label: "Kyrgyzstan", value: "kyrgyzstan"},
        {label: "Laos", value: "laos"},
        {label: "Latvia", value: "latvia"},
        {label: "Lebanon", value: "lebanon"},
        {label: "Lesotho", value: "lesotho"},
        {label: "Liberia", value: "liberia"},
        {label: "Libya", value: "libya"},
        {label: "Liechtenstein", value: "liechtenstein"},
        {label: "Lithuania", value: "lithuania"},
        {label: "Luxembourg", value: "luxembourg"},
        {label: "Macao", value: "macao"},
        {label: "Madagascar", value: "madagascar"},
        {label: "Malawi", value: "malawi"},
        {label: "Malaysia", value: "malaysia"},
        {label: "Maldives", value: "maldives"},
        {label: "Mali", value: "mali"},
        {label: "Malta", value: "malta"},
        {label: "Marshall Islands", value: "marshall islands"},
        {label: "Martinique", value: "martinique"},
        {label: "Mauritania", value: "mauritania"},
        {label: "Mauritius", value: "mauritius"},
        {label: "Mayotte", value: "mayotte"},
        {label: "Mexico", value: "mexico"},
        {label: "Micronesia", value: "micronesia"},
        {label: "Moldova", value: "moldova"},
        {label: "Monaco", value: "monaco"},
        {label: "Mongolia", value: "mongolia"},
        {label: "Montenegro", value: "montenegro"},
        {label: "Montserrat", value: "montserrat"},
        {label: "Morocco", value: "morocco"},
        {label: "Mozambique", value: "mozambique"},
        {label: "Myanmar (Burma)", value: "myanmar (burma)"},
        {label: "Namibia", value: "namibia"},
        {label: "Nauru", value: "nauru"},
        {label: "Nepal", value: "nepal"},
        {label: "Netherlands", value: "netherlands"},
        {label: "New Caledonia", value: "new caledonia"},
        {label: "New Zealand", value: "new zealand"},
        {label: "Nicaragua", value: "nicaragua"},
        {label: "Niger", value: "niger"},
        {label: "Nigeria", value: "nigeria"},
        {label: "Niue", value: "niue"},
        {label: "Norfolk Island", value: "norfolk island"},
        {label: "North Korea", value: "north korea"},
        {label: "North Macedonia", value: "north macedonia"},
        {label: "Northern Mariana Islands", value: "northern mariana islands"},
        {label: "Norway", value: "norway"},
        {label: "Oman", value: "oman"},
        {label: "Pakistan", value: "pakistan"},
        {label: "Palau", value: "palau"},
        {label: "Palestine", value: "palestine"},
        {label: "Panama", value: "panama"},
        {label: "Papua New Guinea", value: "papua new guinea"},
        {label: "Paraguay", value: "paraguay"},
        {label: "Peru", value: "peru"},
        {label: "Philippines", value: "philippines"},
        {label: "Pitcairn Islands", value: "pitcairn islands"},
        {label: "Poland", value: "poland"},
        {label: "Portugal", value: "portugal"},
        {label: "Puerto Rico", value: "puerto rico"},
        {label: "Qatar", value: "qatar"},
        {label: "Réunion", value: "reunion"},
        {label: "Romania", value: "romania"},
        {label: "Russia", value: "russia"},
        {label: "Rwanda", value: "rwanda"},
        {label: "Saint Barthélemy", value: "saint barthelemy"},
        {label: "Saint Helena", value: "saint helena"},
        {label: "Saint Kitts and Nevis", value: "saint kitts and nevis"},
        {label: "Saint Lucia", value: "saint lucia"},
        {label: "Saint Martin", value: "saint martin"},
        {label: "Saint Pierre and Miquelon", value: "saint pierre and miquelon"},
        {label: "Saint Vincent and the Grenadines", value: "saint vincent and the grenadines"},
        {label: "Samoa", value: "samoa"},
        {label: "San Marino", value: "san marino"},
        {label: "Sao Tome and Principe", value: "sao tome and principe"},
        {label: "Saudi Arabia", value: "saudi arabia"},
        {label: "Senegal", value: "senegal"},
        {label: "Serbia", value: "serbia"},
        {label: "Seychelles", value: "seychelles"},
        {label: "Sierra Leone", value: "sierra leone"},
        {label: "Singapore", value: "singapore"},
        {label: "Sint Maarten", value: "sint maarten"},
        {label: "Slovakia", value: "slovakia"},
        {label: "Slovenia", value: "slovenia"},
        {label: "Solomon Islands", value: "solomon islands"},
        {label: "Somalia", value: "somalia"},
        {label: "South Africa", value: "south africa"},
        {label: "South Georgia and the South Sandwich Islands", value: "south georgia and the south sandwich islands"},
        {label: "South Korea", value: "south korea"},
        {label: "South Sudan", value: "south sudan"},
        {label: "Spain", value: "spain"},
        {label: "Sri Lanka", value: "sri lanka"},
        {label: "Sudan", value: "sudan"},
        {label: "Suriname", value: "suriname"},
        {label: "Svalbard and Jan Mayen", value: "svalbard and jan mayen"},
        {label: "Sweden", value: "sweden"},
        {label: "Switzerland", value: "switzerland"},
        {label: "Syria", value: "syria"},
        {label: "Taiwan", value: "taiwan"},
        {label: "Tajikistan", value: "tajikistan"},
        {label: "Tanzania", value: "tanzania"},
        {label: "Thailand", value: "thailand"},
        {label: "Timor-Leste", value: "timor-leste"},
        {label: "Togo", value: "togo"},
        {label: "Tokelau", value: "tokelau"},
        {label: "Tonga", value: "tonga"},
        {label: "Trinidad and Tobago", value: "trinidad and tobago"},
        {label: "Tunisia", value: "tunisia"},
        {label: "Turkey", value: "turkey"},
        {label: "Turkmenistan", value: "turkmenistan"},
        {label: "Turks and Caicos Islands", value: "turks and caicos islands"},
        {label: "Tuvalu", value: "tuvalu"},
        {label: "U.S. Virgin Islands", value: "u.s. virgin islands"},
        {label: "Uganda", value: "uganda"},
        {label: "Ukraine", value: "ukraine"},
        {label: "United Arab Emirates", value: "united arab emirates"},
        {label: "United Kingdom", value: "united kingdom"},
        {label: "United States", value: "united states"},
        {label: "Uruguay", value: "uruguay"},
        {label: "Uzbekistan", value: "uzbekistan"},
        {label: "Vanuatu", value: "vanuatu"},
        {label: "Vatican City", value: "vatican city"},
        {label: "Venezuela", value: "venezuela"},
        {label: "Vietnam", value: "vietnam"},
        {label: "Wallis and Futuna", value: "wallis and futuna"},
        {label: "Western Sahara", value: "western sahara"},
        {label: "Yemen", value: "yemen"},
        {label: "Zambia", value: "zambia"},
        {label: "Zimbabwe", value: "zimbabwe"},
    ] as const;

    const renderLocationList = () => {
        return (
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                            "w-[300px] justify-between",
                            !location && "text-muted-foreground"
                        )}
                    >
                        {location
                            ? locationList.find(
                                (l_location) => l_location.value === location
                            )?.label
                            : "Select country or region"}
                        <ChevronsUpDown className="opacity-50"/>
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0">
                    <Command>
                        <CommandInput
                            placeholder="Search location..."
                            className="h-9"
                        />
                        <CommandList>
                            <CommandEmpty>No location found.</CommandEmpty>
                            <CommandGroup>
                                {locationList.map((l_location) => (
                                    <CommandItem
                                        value={l_location.label}
                                        key={l_location.value}
                                        onSelect={() => {
                                            setLocation(l_location.value)
                                        }}
                                    >
                                        {l_location.label}
                                        <Check
                                            className={cn(
                                                "ml-auto",
                                                l_location.value === location
                                                    ? "opacity-100"
                                                    : "opacity-0"
                                            )}
                                        />
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        );
    }

    const languageList = [
        {label: "English", value: "en"},
        {label: "Chinese (Simplified)", value: "zh-cn"},
        {label: "Chinese (Traditional)", value: "zh-tw"},
        {label: "Spanish", value: "es"},
        {label: "Arabic", value: "ar"},
        {label: "Hindi", value: "hi"},
        {label: "French", value: "fr"},
        {label: "Portuguese", value: "pt"},
        {label: "Russian", value: "ru"},
        {label: "German", value: "de"},
        {label: "Japanese", value: "ja"},
        {label: "Korean", value: "ko"},
        {label: "Bengali", value: "bn"},
        {label: "Danish", value: "da"},
        {label: "Dutch", value: "nl"},
        {label: "Finnish", value: "fi"},
        {label: "Greek", value: "el"},
        {label: "Hebrew", value: "he"},
        {label: "Indonesian", value: "id"},
        {label: "Italian", value: "it"},
        {label: "Malay", value: "ms"},
        {label: "Norwegian", value: "no"},
        {label: "Persian", value: "fa"},
        {label: "Polish", value: "pl"},
        {label: "Swahili", value: "sw"},
        {label: "Swedish", value: "sv"},
        {label: "Tagalog (Filipino)", value: "tl"},
        {label: "Thai", value: "th"},
        {label: "Turkish", value: "tr"},
        {label: "Ukrainian", value: "uk"},
        {label: "Urdu", value: "ur"},
        {label: "Vietnamese", value: "vi"},
    ] as const;

    const renderLanguageList = () => {
        return (
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                            "w-[300px] justify-between",
                            !languages && "text-muted-foreground"
                        )}
                    >
                        {languages
                            ? languageList.find(
                                (language) => language.value === languages
                            )?.label
                            : "Select language"}
                        <ChevronsUpDown className="opacity-50"/>
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0">
                    <Command>
                        <CommandInput
                            placeholder="Search language..."
                            className="h-9"
                        />
                        <CommandList>
                            <CommandEmpty>No language found.</CommandEmpty>
                            <CommandGroup>
                                {languageList.map((language) => (
                                    <CommandItem
                                        value={language.label}
                                        key={language.value}
                                        onSelect={() => {
                                            setLanguages(language.value)
                                        }}
                                    >
                                        {language.label}
                                        <Check
                                            className={cn(
                                                "ml-auto",
                                                language.value === languages
                                                    ? "opacity-100"
                                                    : "opacity-0"
                                            )}
                                        />
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        );
    }

    const [educationEntries, setEducationEntries] = useState<EducationEntry[]>([
        // { id: crypto.randomUUID(), degreeLevel: 'Bachelor', school: '', major: '', startDate: '', endDate: '' }
    ]);

    useEffect(() => {
        setEducation(JSON.stringify(educationEntries, null, 2));
    }, [educationEntries, setEducation]);

    const handleAddEntry = () => {
        setEducationEntries(prev => [
            ...prev,
            {id: crypto.randomUUID(), degreeLevel: '', school: '', major: '', startDate: '', endDate: ''}
        ]);
    };

    const handleRemoveEntry = (id: string) => {
        setEducationEntries(prev => prev.filter(entry => entry.id !== id));
    };

    const handleEntryChange = (id: string, field: keyof EducationEntry, value: string) => {
        setEducationEntries(prev =>
            prev.map(entry =>
                entry.id === id ? {...entry, [field]: value} : entry
            )
        );
    };

    return (
        <div className={styles.contentContainer}>
            <Card>
                <CardHeader>
                    <CardTitle className="flex">Talent Profile</CardTitle>
                    <CardDescription>Finish this profile form to get started with our matching.</CardDescription>
                </CardHeader>
                <CardContent className={styles.cardContent}>
                    <form onSubmit={handleSubmit}>
                        <div className={styles.fieldsGrid}>
                            <div className={styles.inputGroup}>
                                <Label htmlFor="headline">Headline</Label>
                                <Input
                                    id="headline"
                                    type="text"
                                    placeholder="Discribe yourself in a single line."
                                    required
                                    disabled={isSubmitting}
                                />
                            </div>
                            <div className={styles.inputGroup}>
                                <Label htmlFor="bio">Bio</Label>
                                <Textarea
                                    id="bio"
                                    placeholder="Write your bio here."
                                    required
                                    disabled={isSubmitting}
                                />
                            </div>
                            <div className={styles.inputGroup}>
                                <Label htmlFor="location">Location</Label>
                                {renderLocationList()}
                            </div>
                            <div className={styles.inputGroup}>
                                <Label htmlFor="language">Language</Label>
                                {renderLanguageList()}
                            </div>
                            <div className={styles.inputGroup}>
                                <Label htmlFor="yrs-exp">Years of Experience</Label>
                                <Input
                                    id="yrs-exp"
                                    type="number"
                                    placeholder="How many years have you been working in this field? (excluding freelancing and gapping)"
                                    required
                                    disabled={isSubmitting}
                                />
                            </div>
                            <div className={styles.inputGroup}>
                                <Label htmlFor="available-time">Available Time</Label>
                                <Select>
                                    <SelectTrigger className="w-[300px]">
                                        <SelectValue placeholder="Select your available time"/>
                                    </SelectTrigger>
                                    <SelectContent className="w-[300px]">
                                        <SelectGroup>
                                            <SelectLabel>Available Time</SelectLabel>
                                            <SelectItem value="full-time">Full-time</SelectItem>
                                            <SelectItem value="part-time">Part-time</SelectItem>
                                            <SelectItem value="flexible">Flexible</SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className={styles.inputGroup}>
                                <Label htmlFor="work-time-typ">Work Time (typical)</Label>
                                <Input
                                    id="work-time-typ"
                                    type="number"
                                    placeholder="How many hours do you typically work everyday?"
                                    required
                                    disabled={isSubmitting}
                                />
                            </div>
                            <div className={styles.inputGroup}>
                                <Label htmlFor="work-time-max">Work Time (max)</Label>
                                <Input
                                    id="work-time-max"
                                    type="number"
                                    placeholder="How many hours do you max work everyday?"
                                    required
                                    disabled={isSubmitting}
                                />
                            </div>
                            <div className={styles.inputGroup}>
                                <Label htmlFor="salary">Expected Hourly Wage</Label>
                                <div className={styles.salaryInputGroup}>
                                    <Input
                                        id="salary-min"
                                        type="number"
                                        placeholder="Min."
                                        required
                                        className={cn("w-[150px]")}
                                        disabled={isSubmitting}
                                    />
                                    -
                                    <Input
                                        id="salary-max"
                                        type="number"
                                        placeholder="Max."
                                        required
                                        className={cn("w-[150px]")}
                                        disabled={isSubmitting}
                                    />
                                    <Select>
                                        <SelectTrigger className="w-[300px]">
                                            <SelectValue placeholder="Preferred Currency"/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectLabel>Preferred Currency</SelectLabel>
                                                <SelectItem value="USD">United States Dollar (USD) - $</SelectItem>
                                                <SelectItem value="EUR">Euro (EUR) - €</SelectItem>
                                                <SelectItem value="JPY">Japanese Yen (JPY) - ¥</SelectItem>
                                                <SelectItem value="GBP">Pound Sterling (GBP) - £</SelectItem>
                                                <SelectItem value="CNY">Chinese Yuan (CNY) - ¥</SelectItem>
                                                <SelectItem value="AUD">Australian Dollar (AUD) - A$</SelectItem>
                                                <SelectItem value="CAD">Canadian Dollar (CAD) - C$</SelectItem>
                                                <SelectItem value="SGD">Singapore Dollar (SGD) - S$</SelectItem>
                                                <SelectItem value="HKD">Hong Kong Dollar (HKD) - HK$</SelectItem>
                                                <SelectItem value="INR">Indian Rupee (INR) - ₹</SelectItem>
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className={styles.inputGroup}>
                                <Label htmlFor="bio">Education</Label>
                                {educationEntries.map((entry, index) => (
                                    <Card key={entry.id}>
                                        <CardHeader className={styles.entryHeader}>
                                            <span className={styles.degreeLevel}>
                                                {entry.degreeLevel ? `${entry.degreeLevel} Degree` : `Education Entry #${index + 1}`}
                                            </span>
                                            <Button variant="ghost" size="icon"
                                                    onClick={() => handleRemoveEntry(entry.id)}>
                                                <Trash2 className="h-4 w-4 text-muted-foreground"/>
                                            </Button>
                                        </CardHeader>
                                        <CardContent className={styles.fieldsGrid}>
                                            <div className={styles.inputGroup}>
                                                <Label>Degree Level</Label>
                                                <Select
                                                    value={entry.degreeLevel}
                                                    onValueChange={(value: string) => handleEntryChange(entry.id, 'degreeLevel', value)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a degree"/>
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Bachelor">Bachelor's</SelectItem>
                                                        <SelectItem value="Master">Master's</SelectItem>
                                                        <SelectItem value="Doctorate">Doctorate (PhD)</SelectItem>
                                                        <SelectItem value="Other">Other</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className={styles.inputGroup}>
                                                <Label htmlFor={`school-${entry.id}`}>School / University</Label>
                                                <Input
                                                    id={`school-${entry.id}`}
                                                    placeholder="e.g., University of Example"
                                                    value={entry.school}
                                                    onChange={(e) => handleEntryChange(entry.id, 'school', e.target.value)}
                                                />
                                            </div>
                                            <div className={styles.inputGroup}>
                                                <Label htmlFor={`major-${entry.id}`}>Field of Study / Major</Label>
                                                <Input
                                                    id={`major-${entry.id}`}
                                                    placeholder="e.g., Computer Science"
                                                    value={entry.major}
                                                    onChange={(e) => handleEntryChange(entry.id, 'major', e.target.value)}
                                                />
                                            </div>
                                            <div className={styles.entryGrid}>
                                                <div className={styles.inputGroup}>
                                                    <Label htmlFor={`start-date-${entry.id}`}>Start Date</Label>
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <Button variant={"outline"}
                                                                    className={cn("justify-start text-left font-normal", !entry.startDate && "text-muted-foreground")}>
                                                                <CalendarIcon className="mr-2 h-4 w-4"/>
                                                                {entry.startDate ? format(entry.startDate, "MMM yyyy") :
                                                                    <span>Pick a month</span>}
                                                            </Button>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="p-0">
                                                            <MonthPicker
                                                                onMonthSelect={(e) => handleEntryChange(entry.id, 'startDate', e.toString())}
                                                                selectedMonth={entry.startDate ? new Date(entry.startDate) : new Date()}/>
                                                        </PopoverContent>
                                                    </Popover>
                                                </div>
                                                <div className={styles.inputGroup}>
                                                    <Label htmlFor={`end-date-${entry.id}`}>End Date (or
                                                        expected)</Label>
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <Button variant={"outline"}
                                                                    className={cn("justify-start text-left font-normal", !entry.endDate && "text-muted-foreground")}>
                                                                <CalendarIcon className="mr-2 h-4 w-4"/>
                                                                {entry.endDate ? format(entry.endDate, "MMM yyyy") :
                                                                    <span>Pick a month</span>}
                                                            </Button>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="p-0">
                                                            <MonthPicker
                                                                onMonthSelect={(e) => handleEntryChange(entry.id, 'endDate', e.toString())}
                                                                selectedMonth={entry.endDate ? new Date(entry.endDate) : new Date()}/>
                                                        </PopoverContent>
                                                    </Popover>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                                <Button variant="outline" size="sm" onClick={handleAddEntry}
                                        className={styles.addEntryButton}>
                                    + Add Education
                                </Button>
                            </div>
                            <div className={styles.inputGroup}>
                                <Label htmlFor="portfolio">Portfolio</Label>
                                <Textarea
                                    id="portfolio"
                                    placeholder="Briefly describe your projects and experiences."
                                    required
                                    disabled={isSubmitting}
                                />
                            </div>
                            <div className={styles.inputGroup}>
                                <Label htmlFor="remarks">Remarks</Label>
                                <Textarea
                                    id="remarks"
                                    placeholder="Write here if you have any special requests or notes."
                                    required
                                    disabled={isSubmitting}
                                />
                            </div>
                            {error && <p className={styles.errorMessage}>{error}</p>}
                            <Button type="submit" className={styles.submitButton} disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className={styles.spinner}/>}
                                {isSubmitting ? "Submitting..." : "Submit Profile"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}