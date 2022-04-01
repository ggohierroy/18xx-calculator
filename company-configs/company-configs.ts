type CompanyConfigOption = {
    [gameCode: string]: {
        companies: {
            [companyCode: string]: {
                companyCode: string
                name: string
                shortName: string
                color: string
            }
        }
        parTable: number[] | null
    }
}

const CompanyConfig: CompanyConfigOption = {
    "1882": {
        "companies": {
            "canadian-national": {
                "companyCode": "canadian-national",
                "name": "Canadian National",
                "shortName": "CN",
                "color": "#FFA500"
            },
            "canadian-northern": {
                "companyCode": "canadian-northern",
                "name": "Canadian Northern",
                "shortName": "CNR",
                "color": "#237333"
            },
            "canadian-pacfic-railway": {
                "companyCode": "canadian-pacfic-railway",
                "name": "Canadian Pacific Railway",
                "shortName": "CPR",
                "color": "#D81E3E"
            },
            "grand-trunk-pacific": {
                "companyCode": "grand-trunk-pacific",
                "name": "Grand Trunk Pacific",
                "shortName": "GTR",
                "color": "#000000"
            },
            "hudson-bay-railway": {
                "companyCode": "hudson-bay-railway",
                "name": "Hudson Bay Railway",
                "shortName": "HBR",
                "color": "#FFD700"
            },
            "quappelle-long-lake-railroad": {
                "companyCode": "quappelle-long-lake-railroad",
                "name": "Qu'Appelle, Long Lake Railroad Co.",
                "shortName": "QLL",
                "color": "#800080"
            },
            "saskatchewan-central-railroad": {
                "companyCode": "saskatchewan-central-railroad",
                "name": "Saskatchewan Central Railroad",
                "shortName": "SC",
                "color": "#0189D1"
            }
        },
        "parTable": [67, 71, 76, 82, 90, 100]
    },
    "18Chesapeake": {
        "companies": {
            "baltimore-ohio-railroad": {
                "companyCode": "baltimore-ohio-railroad",
                "name": "Baltimore & Ohio Railroad",
                "shortName": "B&O",
                "color": "#0189D1"
            },
            "camden-amboy-railroad": {
                "companyCode": "camden-amboy-railroad",
                "name": "Camden & Amboy Railroad",
                "shortName": "C&A",
                "color": "#F48221"
            },
            "chesapeake-ohio-railroad": {
                "companyCode": "chesapeake-ohio-railroad",
                "name": "Chesapeake & Ohio Railroad",
                "shortName": "C&O",
                "color": "#A2DCED"
            },
            "lehigh-valley-railroad": {
                "companyCode": "lehigh-valley-railroad",
                "name": "Lehigh Valley Railroad",
                "shortName": "LV",
                "color": "#FFF500"
            },
            "norfolk-western-railway": {
                "companyCode": "norfolk-western-railway",
                "name": "Norfolk & Western Railway",
                "shortName": "N&W",
                "color": "#7B352A"
            },
            "pittsburgh-lake-erie-railroad": {
                "companyCode": "pittsburgh-lake-erie-railroad",
                "name": "Pittsburgh and Lake Erie Railroad",
                "shortName": "PLE",
                "color": "#000000"
            },
            "pennsylvania-railroad": {
                "companyCode": "pennsylvania-railroad",
                "name": "Pennsylvania Railroad",
                "shortName": "PRR",
                "color": "#237333"
            },
            "strasburg-rail-road": {
                "companyCode": "strasburg-rail-road",
                "name": "Strasburg Rail Road",
                "shortName": "SRR",
                "color": "#D81E3E"
            }
        },
        "parTable": [70, 80, 95]
    },
    "1849": {
        "companies": {
            "azienda-ferroviaria-garibaldi": {
                "companyCode": "azienda-ferroviaria-garibaldi",
                "name": "Azienda Ferroviaria Garibaldi",
                "shortName": "AFG",
                "color": "#FF0000"
            },
            "canadian-northern": {
                "companyCode": "impresa-ferroviaria-trinacria",
                "name": "Impresa Ferroviaria Trinacria",
                "shortName": "IFT",
                "color": "#0189D1"
            },
            "compagnia-trasporti-lilibeo": {
                "companyCode": "compagnia-trasporti-lilibeo",
                "name": "Compagnia Trasporti Lilibeo",
                "shortName": "CTL",
                "color": "#F9B231"
            },
            "rete-centrale-sicula": {
                "companyCode": "rete-centrale-sicula",
                "name": "Rete Centrale Sicula",
                "shortName": "RCS",
                "color": "#F48221"
            },
            "azienda-transporti-archimede": {
                "companyCode": "azienda-transporti-archimede",
                "name": "Azienda Trasporti Archimede",
                "shortName": "ATA",
                "color": "#008000"
            },
            "societa-ferroviaria-akragas": {
                "companyCode": "societa-ferroviaria-akragas",
                "name": "Società Ferroviaria Akragas",
                "shortName": "SFA",
                "color": "#FFC0CB"
            }
        },
        "parTable": null
    }
}

export default CompanyConfig;