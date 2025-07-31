import { Dimensions } from "react-native";
const {width,height} = Dimensions.get('screen');

export const PRODUCTCOLORS = {
	"": "",
	"7317": "#580F41", // Aubergine
	"8997": "#36393F", // Anthracite
	"5494": "#C0C0C0", // Argentée
	"5445": "#F5F5DC", // Beige
	"6691": "#FAF0E6", // Beige clair
	"5446": "#FFFFFF", // Blanc
	"5447": "#F8F8FF", // Blanc cassé
	"9203": "#F0F0F0", // Blanc Moucheté
	"5463": "#FFF8DC", // Blanc sale
	"5452": "#0000FF", // Bleu
	"5501": "#6699CC", // Bleu cassé
	"5476": "#87CEEB", // Bleu ciel
	"15918": "#ADD8E6", // Bleu clair
	"8129": "#4169E1", // Bleu Roi
	"8006": "#1F51FF", // Bleu fluo
	"15528": "#00008B", // Bleu foncé
	"7011": "#6050DC", // Bleu Majorelle
	"5484": "#000080", // Bleu marine
	"5469": "#191970", // Bleu nuit
	"16021": "#AEC6CF", // Bleu pastel
	"16073": "#005F6A", // Bleu Pétrole
	"5468": "#40E0D0", // Bleu turquoise
	"5472": "#CD7F32", // Bronze
	"15488": "#8B4513", // Chêne foncé
	"15487": "#CD853F", // Chêne clair
	"5502": "#FFDDA0", // Caramel
	"7094": "#C19A6B", // Camel
	"9266": "#FF7F50", // Coraille
	"7126": "#B8B8D1", // Chrome
	"5464": "#FFFDD0", // Crème
	"16403": "#00FFFF", // Cyan
	"5450": "#FFD700", // Doré
	"5444": "#808080", // Gris
	"5474": "#36454F", // Gris charbon
	"5480": "#BEBEBE", // Grège
	"7059": "#D3D3D3", // Gris clair
	"5454": "#FFFF00", // Jaune
	"8593": "#FFDB58", // Jaune Moutarde
	"5488": "#F1C40F", // Jaune Fleurissant
	"7672": "#CCFF00", // Jaune fluo
	"5455": "#964B00", // Marron
	"7430": "#654321", // Marron foncé
	"7431": "#A0522D", // Marron clair
	"15483": "#FFFFFF", // Multi-couleurs (placeholder)
	"5449": "#000000", // Noir
	"5451": "#FFA500", // Orange
	"5448": "#FF0000", // Rouge
	"5467": "#800020", // Rouge Bordeaux
	"5478": "#E52B50", // Rouge amarante
	"7533": "#8B0000", // Rouge foncé
	"5456": "#FFC0CB", // Rose
	"5461": "#FF00FF", // Rose fuchsia
	"5479": "#D291BC", // Rose métallique
	"9393": "#FFD1DC", // Rose Pastel
	"5462": "#FFB6C1", // Rose bébé
	"7061": "#FFCCE5", // Rose clair
	"6690": "#F2A2B3", // Rose dragée
	"7927": "#C71585", // Rose foncé
	"5458": "#FA8072", // Saumon
	"8533": "#483C32", // Taupe
	"7398": "transparent", // Transparent
	"7628": "#878681", // Titanium
	"5453": "#008000", // Vert
	"15486": "#90EE90", // Vert Clair
	"5487": "#006400", // Vert foncé
	"5499": "#7CFC00", // Vert gazon
	"7010": "#4B5320", // Vert militaire
	"5481": "#808000", // Vert Olive
	"5466": "#93C572", // Vert Pistache
	"5495": "#7FFFD4", // Vert d eau
	"5457": "#8A2BE2", // Violet
	"5500": "#702963", // Violet byzantin
	"9333": "#EE82EE", // Violet clair
	"17761": "#FF69B4", // Rose Bonbon
	"17752": "#77DD77", // Vert Pastel
	"15505": "#9400D3", // Violet foncé
	"17762": "#9ACD32", // Vert citron
	"17763": "#30D5C8", // Vert turquoise
	"17767": "#2F4F4F"  // Noir Moucheté
}

export const COLORS = {

	//primary blue
	primary: "#232f40",
	primary_100: "#496285",
	primaryLight: "#DFE7F4",
	secondary: "orange",
	secondaryLight: "#f5e0b8",
	secondary_100:"#755b29",
	success: "#159E42",
	danger: "#FF3131",
	warning: "#ffb02c",
	dark: "#2f2f2f",
	light: "#E6E6E6",
	info: "#2B39B9",
	white: "#fff",
	label: "#8A8A8A",
	backgroundColor: "#fff",
	black: "#000",
	lightGray: "#F5F5F5",
	gray: "#B1B1B1",
	
	//light theme
	card : "#fff",
	background : "#F2F3F8",
	text : "#7D899D",
	title : "#000000",
	borderColor : "rgba(0,0,0,.1)",
	input : "rgba(0,0,0,.03)",
	
	//dark theme
	darkCard : "rgba(255,255,255,.05)",
	darkBackground : "rgba(0,3,3,.9)",
	darkText : "rgba(255,255,255,.6)",
	darkTitle : "#fff",
	darkBorder : "rgba(255,255,255,.2)",
	darkInput : "rgba(255,255,255,.05)",
	deepOrange: "#rgb(255, 136, 0)",

	
}

export const SIZES = {
	fontLg: 16,
	font: 14,
	fontSm: 13,
	fontXs: 12,

	//radius
	radius_sm: 8,
	radius: 6,
	radius_lg: 15,

	//space
	padding: 15,
	margin: 15,

	//Font Sizes
	h1: 40,
	h2: 28,
	h3: 24,
	h4: 20,
	h5: 18,
	h6: 16,

	//App dimensions
	width,
	height,

	container: 800,
};

export const FONTS = {
	fontLg: { fontSize: SIZES.fontLg, color: COLORS.text, lineHeight: 20, fontFamily: 'JostRegular' },
	font: { fontSize: SIZES.font, color: COLORS.text, lineHeight: 20, fontFamily: 'JostRegular' },
	fontSm: { fontSize: SIZES.fontSm, color: COLORS.text, lineHeight: 18, fontFamily: 'JostRegular' },
	fontXs: { fontSize: SIZES.fontXs, color: COLORS.text, lineHeight: 14, fontFamily: 'JostRegular' },
	h1: { fontSize: SIZES.h1, color: COLORS.title, fontFamily: 'JostSemiBold' },
	h2: { fontSize: SIZES.h2, color: COLORS.title, fontFamily: 'JostSemiBold' },
	h3: { fontSize: SIZES.h3, color: COLORS.title, fontFamily: 'JostSemiBold' },
	h4: { fontSize: SIZES.h4, color: COLORS.title, fontFamily: 'JostSemiBold' },
	h5: { fontSize: SIZES.h5, color: COLORS.title, fontFamily: 'JostSemiBold' },
	h6: { fontSize: SIZES.h6, color: COLORS.title, fontFamily: 'JostSemiBold' },
	fontBold: { fontFamily: 'JostBold' },
	fontMedium: { fontFamily: 'JostMedium' },
	fontTitle: { fontFamily: 'JostMedium' },
	fontRegular: { fontFamily: 'JostRegular' },
	fontSemiBold: { fontFamily: 'JostSemiBold' },
	fontJostLight: { fontFamily: 'JostLight' },
	fontJostExtraLight: { fontFamily: 'JostExtraLight' },
	Marcellus: { fontFamily: 'MarcellusRegular' },
	fontJostItalic: { fontFamily: 'JostItalic' },
	fontJostSemiBoldItalic: { fontFamily: 'JostSemiBoldItalic' },
	fontJostLightItalic: { fontFamily: 'JostLightItalic' },
	fontJostMediumItalic: { fontFamily: 'JostMediumItalic' },
	cairoBlack: { fontFamily: 'CairoBlack' },
    cairoBold: { fontFamily: 'CairoBold' },
    cairoExtraBold: { fontFamily: 'CairoExtraBold' },
    cairoExtraLight: { fontFamily: 'CairoExtraLight' },
    cairoLight: { fontFamily: 'CairoLight' },
    cairoMedium: { fontFamily: 'CairoMedium' },
    cairoRegular: { fontFamily: 'CairoRegular' },
    cairoSemiBold: { fontFamily: 'CairoSemiBold' },
}
export const FONTS_CAIRO = {
	fontLg: { fontSize: SIZES.fontLg, color: COLORS.text, lineHeight: 20, fontFamily: 'Cairo-Regular' },
	font: { fontSize: SIZES.font, color: COLORS.text, lineHeight: 20, fontFamily: 'Cairo-Regular' },
	fontSm: { fontSize: SIZES.fontSm, color: COLORS.text, lineHeight: 18, fontFamily: 'Cairo-Regular' },
	fontXs: { fontSize: SIZES.fontXs, color: COLORS.text, lineHeight: 14, fontFamily: 'Cairo-Regular' },
	h1: { fontSize: SIZES.h1, color: COLORS.title, fontFamily: 'Cairo-SemiBold' },
	h2: { fontSize: SIZES.h2, color: COLORS.title, fontFamily: 'Cairo-SemiBold' },
	h3: { fontSize: SIZES.h3, color: COLORS.title, fontFamily: 'Cairo-SemiBold' },
	h4: { fontSize: SIZES.h4, color: COLORS.title, fontFamily: 'Cairo-SemiBold' },
	h5: { fontSize: SIZES.h5, color: COLORS.title, fontFamily: 'Cairo-SemiBold' },
	h6: { fontSize: SIZES.h6, color: COLORS.title, fontFamily: 'Cairo-SemiBold' },
	fontBold: { fontFamily: 'Cairo-Bold' },
	fontMedium: { fontFamily: 'Cairo-Medium' },
	fontTitle: { fontFamily: 'Cairo-Medium' },
	fontRegular: { fontFamily: 'Cairo-Regular' },
	fontSemiBold: { fontFamily: 'Cairo-SemiBold' },
	fontExtraLight: { fontFamily: 'Cairo-ExtraLight' },
	fontLight: { fontFamily: 'Cairo-Light' },
	fontExtraBold: { fontFamily: 'Cairo-ExtraBold' },
	fontBlack: { fontFamily: 'Cairo-Black' },
}


const appTheme = {COLORS, SIZES, FONTS}

export default appTheme;