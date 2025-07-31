import React, {  useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView } from 'react-native'
import { GlobalStyleSheet } from '@/constants/StyleSheet';
import { COLORS, FONTS, PRODUCTCOLORS } from '@/constants/theme';
import { IMAGES } from '@/constants/Images';
import Button from '../Button/Button';
import { useNavigation, useTheme } from '@react-navigation/native';
import ButtonOutline from '../Button/ButtonOutline';
import { getAttributeValues } from '@/api/productsApi';
import { t } from 'i18next';
import Input from '../Input/Input';





type Props = {
  sheetRef: any,
  onApply: (filters: any) => void
  productsData?: any
}
const FilterSheet2 = ({sheetRef, onApply,productsData} : Props) => {

  const theme = useTheme();
  const { colors } : {colors : any} = theme;

  const navigation = useNavigation();
  

  // const brandData = ["Adidas", "Reebok", "Zara", "Gucci", "Vogue"];

  // const [activeSize, setActiveSize] = useState(brandData[0]);

  

  const [selectedCategory, setSelectedCategory] = useState<any>();
  const [selectedSize, setSelectedSize] = useState<any>();
  const [selectedColor, setSelectedColor] = useState<any>();
  const [selectedBrand, setSelectedBrand] = useState<any>();
  const [selectedTypeAlimentation, setSelectedTypeAlimentation] = useState<any>();
  const [categories, setCategories] = useState<any>([]);
  const [brands, setBrands] = useState<any>([]);
  const [couleurs, setCouleurs] = useState<any>([]);
  const [sizes, setSizes] = useState<any>([]);
  const [typeAlimentations, setTypeAlimentations] = useState<any>([]);

  const [priceRange, setPriceRange] = useState([null, null]);

  useEffect(() => {
    const loadAttributes = async () => {
  
        /**{"appliedFilters": {}, "brands": [9971, 9876, 9825, 9871, 9878], 
         * "category": {"__typename": "CategoryTree", "children": [], "id": 5, "image": "https://www.wamia.tn/media/catalog/category/new-electro.jpg", "level": 2, "magefan_og_image": "/_lectrom_nager_288p.jpg", "name": "Électroménager"}, 
         * "couleurs": ["5446", "5449", "5494", "5448", "5453"], "sizes": [], 
         * "subcategories": [{"__typename": "CategoryTree", "children": [Array], "id": 13, "image": "https://www.wamia.tn/media/catalog/category/Robot_cuisine_1700.443.jpg", "include_in_menu": 1, "level": 3, "magefan_og_image": "/Robot_cuisine_288p.jpg", "name": "Robot cuisine"}, {"__typename": "CategoryTree", "children": [Array], "id": 18, "image": "https://www.wamia.tn/media/catalog/category/Appareils_de_cuisson_1700.443.jpg", "include_in_menu": 1, "level": 3, "magefan_og_image": "/Appareils_de_cuisson_288p.jpg", "name": "Appareils de cuisson"}, {"__typename": "CategoryTree", "children": [Array], "id": 139, "image": "https://www.wamia.tn/media/catalog/category/Caf___petit_d_jeuner_1700.443.jpg", "include_in_menu": 1, "level": 3, "magefan_og_image": "/Caf____petit_d_jeuner_288p.jpg", 
"name": "Café & petit déjeuner"}], 
"typeaAlimentations": ["10683", "10686"]} */

/**
 * {"appliedFilters": {}, 
 * "brands": Set {null, 9971, 9876, 9825, 9871, 9878, 16633, 9912}, 
 * "category": {"__typename": "CategoryTree", "children": [], "id": 5, "image": "https://www.wamia.tn/media/catalog/category/new-electro.jpg", "level": 2, "magefan_og_image": "/_lectrom_nager_288p.jpg", "name": "Électroménager"}, 
 * "couleurs": Set {null, "5446", "5449", "5494", "5448", "5453", "5444", "5456", "5452"}, 
 * "sizes": Set {null}, 
 * "subcategories": [{"__typename": "CategoryTree", "children": [Array], "id": 13, "image": "https://www.wamia.tn/media/catalog/category/Robot_cuisine_1700.443.jpg", "include_in_menu": 1, "level": 3, "magefan_og_image": "/Robot_cuisine_288p.jpg", "name": "Robot cuisine"}, {"__typename": "CategoryTree", "children": [Array], "id": 18, 
"image": "https://www.wamia.tn/media/catalog/category/Appareils_de_cuisson_1700.443.jpg", "include_in_menu": 1, "level": 3, "magefan_og_image": "/Appareils_de_cuisson_288p.jpg", "name": "Appareils de cuisson"}, {"__typename": "CategoryTree", "children": [Array], "id": 139, "image": "https://www.wamia.tn/media/catalog/category/Caf___petit_d_jeuner_1700.443.jpg", "include_in_menu": 1, "level": 3, "magefan_og_image": "/Caf____petit_d_jeuner_288p.jpg", "name": "Café & petit déjeuner"}, {"__typename": "CategoryTree", "children": [Array], "id": 6, "image": "https://www.wamia.tn/media/catalog/category/Gros_Electrom_nager_1700.443_1.jpg", "include_in_menu": 1, "level": 3, "magefan_og_image": "/Gros_Electrom_nager_288p.jpg", "name": "Gros Electroménager "}, {"__typename": "CategoryTree", "children": [Array], "id": 30, "image": "https://www.wamia.tn/media/catalog/category/Aspirateurs___nettoyeurs___entretien_1700.443.jpg", "include_in_menu": 1, "level": 3, "magefan_og_image": "/Aspirateurs___nettoyeurs___entretien_288p.jpg", "name": "Aspirateurs & nettoyeurs & entretien "}, {"__typename": "CategoryTree", "children": [Array], "id": 2968, "image": "https://www.wamia.tn/media/catalog/category/Chauffage_et_Climatisation_1700.443.jpg", "include_in_menu": 1, "level": 3, "magefan_og_image": "/Chauffage_et_Climatisation_288p.jpg", "name": "Chauffage et Climatisation"}, {"__typename": "CategoryTree", "children": [Array], "id": 2969, "image": "https://www.wamia.tn/media/catalog/category/_lectrom_nager_sp_cialis__1700.443.jpg", "include_in_menu": 
1, "level": 3, "magefan_og_image": "/_lectrom_nager_sp_cialis__288p.jpg", "name": "Électroménager spécialisé"}], 
"typeaAlimentations": Set {null, "10683", "10686", "10683,10686"}}
 */


      
        const response = await getAttributeValues('brand')
        const brands = response.filter((brand: any) => productsData.brands.includes(Number(brand.key)))
        setBrands(brands) 
        const response2 = await getAttributeValues('couleur')
        const couleurs = response2.filter((couleur: any) => productsData.couleurs.includes(couleur.value))
        setCouleurs(couleurs)
        const response3 = await getAttributeValues('size')
        const sizes = response3.filter((size: any) => productsData.sizes.includes(size.value))
        setSizes(sizes)
        const response4 = await getAttributeValues('type_alimentation')
        const typeAlimentations = response4.filter((typeAlimentation: any) => productsData.typeaAlimentations.includes(typeAlimentation.value))
        setTypeAlimentations(typeAlimentations)
        const categoriesData = productsData?.subcategories.map((data:any) => {
          return {
            label: data.name,
            value: data.id.toString()}
        });
        setCategories(categoriesData)
        const appliedFilters = productsData?.appliedFilters;
        if (appliedFilters) {
          setSelectedCategory(categoriesData.find((category:any) => appliedFilters.category && category.value === appliedFilters.category.value))
          
          setSelectedBrand(brands.find((brand:any) => appliedFilters.brand && brand.value === appliedFilters.brand.value))

          setSelectedColor(couleurs.find((couleur:any) => appliedFilters.color && couleur.value === appliedFilters.color.value))

          setSelectedSize(sizes?.find((size:any) => appliedFilters.size && size.value === appliedFilters.size.value))

          setSelectedTypeAlimentation(typeAlimentations.find((typeAlimentation:any) => appliedFilters.type_alimentation && typeAlimentation.value === appliedFilters.type_alimentation.value))
          
          
          if(appliedFilters.priceRange)setPriceRange(appliedFilters.priceRange)

    
          // setPriceRange(appliedFilters.priceRange)
        }
        
      
    }

    loadAttributes()

  },[]);

  const handleApply = () => {
    const filters = {
      brand: selectedBrand,
      category: selectedCategory, 
      size: selectedSize,
      color: selectedColor,
      type_alimentation: selectedTypeAlimentation,
      priceRange: priceRange
    };
    onApply(filters);
  };

  const handleReset = () => {
    setSelectedCategory(null)
                      setSelectedBrand(null)
                      setSelectedColor(null)
                      setSelectedSize(null)
                      setSelectedTypeAlimentation(null)
                      setPriceRange([null, null])
                      onApply({
                        brand: null,
                        category: null, 
                        size: null,
                        color: null,
                        type_alimentation: null,
                        priceRange: [null, null]
                      })
  }

  const renderFilterSection = (
    title: string,
    data: any[],
    selected: any,
    onSelect: (item: any) => void,
    labelSelector: (item: any) => string
  ) => {
    return (
      <>
        <View style={{ flexDirection: 'row', flexWrap:'wrap', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
          <Text style={{ ...FONTS.fontMedium, fontSize: 15, color: colors.title }}>{t(title)}:</Text>
          {/* ...existing code... */}
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginTop: 10 }}>
          {data.map((item, index) => {
            return (
            <TouchableOpacity
              key={index}
              onPress={() => 
              {
                selected === item ? onSelect(null) : onSelect(item)
              }
                //(selected === item ? onSelect(null) : onSelect(item))
              }
              style={[
                {
                  height: 40,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 1,
                  borderColor: title != "color" ?COLORS.primaryLight: 'transparent',
                  paddingHorizontal: 20,
                  paddingVertical: 5,
                  marginBottom: 5,
                },
                selected === item && title != "color" && {
                  backgroundColor: COLORS.primary,
                  borderColor: COLORS.primary,
                }
              ]}
            >
              {title=="color"?
               <View 
               style={[{
                 height:45,
                 width:45,
                 borderRadius:50,
                 borderWidth:1,
                 borderColor:COLORS.primaryLight,
                 alignItems:'center',
                 justifyContent:'center'
                 },selectedColor === item && {
                   borderColor:COLORS.primary
                 }]}
               >  
                 <View
                     style={{height:30,width:30,borderRadius:30, backgroundColor:PRODUCTCOLORS[item.value]}}
                 />
             </View>
              
              :<Text style={[
                  { ...FONTS.fontMedium, fontSize: 13, color: colors.title },
                  selected === item && { color: theme.dark ? COLORS.white : COLORS.white }
                ]}>
                {labelSelector(item)}
              </Text>}
            </TouchableOpacity>
          )})}
        </View>
      </>
    );
  };

  return (
      <View style={[GlobalStyleSheet.container, { paddingTop: 0,backgroundColor:theme.dark ? colors.background :colors.card }]}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
              paddingBottom: 10,
              paddingTop:10,
              marginHorizontal: -15,
              paddingHorizontal: 15
            }}
          >
            <Text style={[FONTS.fontMedium, { color: colors.title, fontSize: 16 }]}>{t("filter")}</Text>
            <TouchableOpacity
              style={{ height: 38, width: 38, backgroundColor: colors.card, borderRadius: 38, alignItems: 'center', justifyContent: 'center' }}
              onPress={() => sheetRef.current.close()}
            >
              <Image
                style={{ width: 18, height: 18, resizeMode: 'contain', tintColor: colors.title }}
                source={IMAGES.close}
              />
            </TouchableOpacity>
          </View>   
          <ScrollView contentContainerStyle={{ paddingBottom: 80 }}> 
          <View style={{ flexDirection: 'row', gap: 10, paddingRight: 10, marginTop: 20,marginBottom:30 }}>
                <View style={{ width: '50%' }}>
                  <ButtonOutline
                    title={t("reset")}
                    color={COLORS.primaryLight}
                    text={COLORS.primary}
                    onPress={handleReset}
                  />
                </View>   
                <View style={{ width: '50%' }}>
                  <Button
                    title={t("apply")}
                    text={ COLORS.white}
                    color={COLORS.primary}
                    onPress={handleApply}
                  />
                </View>
              </View>
              {couleurs.length>0 && renderFilterSection("color", couleurs, selectedColor, setSelectedColor, (item) => item.label)}
              {renderFilterSection("category", categories, selectedCategory, setSelectedCategory, (item) => item.label)}
              {brands.length>0 && renderFilterSection("brand", brands, selectedBrand, setSelectedBrand, (item) => item.label)}
              {sizes.length>0 && renderFilterSection("size", sizes, selectedSize, setSelectedSize, (item) => item.label)}
              {typeAlimentations.length>0 && renderFilterSection("type_alimentation", typeAlimentations, selectedTypeAlimentation, setSelectedTypeAlimentation, (item) => item.label)}
              <View style={{ marginTop: 20 }}>
          <Text style={{ ...FONTS.fontMedium, fontSize: 15, color: colors.title }}>{t('price_range')}:</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
            <Input
            
            placeholder={t('from')}
            value={priceRange[0] ? priceRange[0].toString() : ''}
            keyboardType='numeric'  
            style={{
              margin : 10,
              width: 160,
            }}
            onChangeText={(text) => setPriceRange([Number(text), priceRange[1]])}

            
            />
            <Input
            placeholder={t('to')}
            value={priceRange[1] ? priceRange[1].toString() : ''}
            keyboardType='numeric'
            style={{
              margin : 10,
              width: 160,
            }}
            onChangeText={(text) => setPriceRange([priceRange[0], Number(text)])}
            />
          </View>
          <View style={{height:40}}></View>
        </View>
              
          </ScrollView>
      </View>
  )
}

export default FilterSheet2