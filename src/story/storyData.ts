/**
 * Story Journey Data & Narrative Definitions
 * Adventures of Trishu — The Grand Story Journey
 * Strictly under 500 Lines of Code
 */

import { GameModeId } from '../types/game';
import { StoryChapter, StoryStopDef } from '../types/story';

export const STORY_CHAPTERS: StoryChapter[] = [
  {
    id: 1,
    title: 'The Sunny Farm Morning',
    subtitle: 'Wake up with Mrs Clucky & friends',
    emoji: '☀️',
    biome: 'farm',
    bgGradient: ['#E8F5E9', '#C8E6C9'],
    pathColor: '#81C784',
    stopIndices: [0, 1, 2]
  },
  {
    id: 2,
    title: 'Breakfast & Dressing Up',
    subtitle: 'Kitchen fun & silly outfits',
    emoji: '🥞',
    biome: 'home',
    bgGradient: ['#FFF3E0', '#FFE0B2'],
    pathColor: '#FFB74D',
    stopIndices: [3, 4, 5]
  },
  {
    id: 3,
    title: 'Splashes & Outdoor Fun',
    subtitle: 'Muddy boots, bubbles & balloons',
    emoji: '🌧️',
    biome: 'mud',
    bgGradient: ['#E0F2F1', '#B2DFDB'],
    pathColor: '#4DB6AC',
    stopIndices: [6, 7, 8]
  },
  {
    id: 4,
    title: "Grandpa's Garden & Train",
    subtitle: 'Harvest veggies & chug the rails',
    emoji: '🚂',
    biome: 'garden',
    bgGradient: ['#F1F8E9', '#DCEDC8'],
    pathColor: '#9CCC65',
    stopIndices: [9, 10, 11]
  },
  {
    id: 5,
    title: 'Sunny Park & Windy Castle',
    subtitle: 'Bubbles, ice cream & kite flying',
    emoji: '🏰',
    biome: 'castle',
    bgGradient: ['#E1F5FE', '#B3E5FC'],
    pathColor: '#4FC3F7',
    stopIndices: [12, 13, 14, 15]
  }
];

export const STORY_STOPS: StoryStopDef[] = [
  // Chapter 1: The Sunny Farm Morning
  {
    index: 0,
    id: 'stop_1_egg_laying',
    modeId: 'EGG_LAYING',
    chapterId: 1,
    title: "Good Morning, Mrs Clucky!",
    subtitle: "Hatch the morning eggs",
    storyBlurb: "Cock-a-doodle-doo! The morning sun is shining over the coop. Mrs Clucky is ready to lay warm eggs—tap to hatch fluffy baby chicks!",
    victoryBlurb: "Hooray! The eggs hatched into cheerful little chicks!",
    goalDescription: "Hatch 5 little chicks",
    goalTarget: 5,
    stampId: 'stamp_golden_egg',
    stampEmoji: '🥚',
    stampName: 'Golden Egg Stamp',
    stampColor: '#FBC02D',
    nodeBgColor: '#FFF9C4'
  },
  {
    index: 1,
    id: 'stop_2_chick_maze',
    modeId: 'CHICK_MAZE',
    chapterId: 1,
    title: "The Lost Chick Trail",
    subtitle: "Guide baby chicks home",
    storyBlurb: "The curious baby chicks wandered out into the green grass! Scatter golden corn seeds to lead them safely back into their cozy coop.",
    victoryBlurb: "Wonderful! All the chicks are snug and warm in the coop!",
    goalDescription: "Save 3 lost chicks",
    goalTarget: 3,
    stampId: 'stamp_fluffy_chick',
    stampEmoji: '🐥',
    stampName: 'Fluffy Chick Stamp',
    stampColor: '#FFA000',
    nodeBgColor: '#FFFDE7'
  },
  {
    index: 2,
    id: 'stop_3_peek_a_boo',
    modeId: 'PEEK_A_BOO',
    chapterId: 1,
    title: "Barnyard Hide & Seek",
    subtitle: "Find cute animal friends",
    storyBlurb: "The barnyard animals are playing peek-a-boo! Tap behind the haystacks, wooden fences, and barrels to see who is hiding.",
    victoryBlurb: "You found all the giggling barnyard friends!",
    goalDescription: "Find 4 hidden friends",
    goalTarget: 4,
    stampId: 'stamp_barnyard_friends',
    stampEmoji: '🐮',
    stampName: 'Barnyard Friend Stamp',
    stampColor: '#66BB6A',
    nodeBgColor: '#E8F5E9'
  },

  // Chapter 2: Breakfast & Dressing Up
  {
    index: 3,
    id: 'stop_4_daddy_pig',
    modeId: 'DADDY_PIG',
    chapterId: 2,
    title: "Dad's Kitchen Dash",
    subtitle: "Cook a big family breakfast",
    storyBlurb: "Time for breakfast! Dad is cooking up a storm in the kitchen. Help catch toast, fruit, and sizzling pancakes before anything burns!",
    victoryBlurb: "Yum yum! Breakfast is served for the whole family!",
    goalDescription: "Catch 6 breakfast items",
    goalTarget: 6,
    stampId: 'stamp_master_chef',
    stampEmoji: '🍳',
    stampName: 'Master Chef Stamp',
    stampColor: '#4DD0E1',
    nodeBgColor: '#E0F7FA'
  },
  {
    index: 4,
    id: 'stop_5_pancake_flipper',
    modeId: 'PANCAKE_FLIPPER',
    chapterId: 2,
    title: "Mom's Pancake Tower",
    subtitle: "Flip & stack golden pancakes",
    storyBlurb: "Mom is flipping the fluffiest golden pancakes! Tap the frying pan to flip them high in the air and stack a gigantic pancake tower!",
    victoryBlurb: "What a glorious, syrupy pancake tower!",
    goalDescription: "Flip 3 golden pancakes",
    goalTarget: 3,
    stampId: 'stamp_pancake_stack',
    stampEmoji: '🥞',
    stampName: 'Pancake Stack Stamp',
    stampColor: '#FFB74D',
    nodeBgColor: '#FFF3E0'
  },
  {
    index: 5,
    id: 'stop_6_mix_match',
    modeId: 'MIX_MATCH',
    chapterId: 2,
    title: "Silly Dress-Up Studio",
    subtitle: "Pick outfits & take funny photos",
    storyBlurb: "Let's dress up for our big adventure! Shuffle funny heads, superhero shirts, and boots, then tap the camera to snap a keepsake photo!",
    victoryBlurb: "Click! That funny picture is saved to your album!",
    goalDescription: "Snap 1 silly photo",
    goalTarget: 1,
    stampId: 'stamp_photo_album',
    stampEmoji: '📸',
    stampName: 'Photo Album Stamp',
    stampColor: '#BA68C8',
    nodeBgColor: '#F3E5F5'
  },

  // Chapter 3: Splashes & Outdoor Fun
  {
    index: 6,
    id: 'stop_7_muddy_puddles',
    modeId: 'MUDDY_PUDDLES',
    chapterId: 3,
    title: "Muddy Puddles Jump",
    subtitle: "Splish, splash in golden wellies",
    storyBlurb: "A warm rain shower left big brown puddles! Pull on your shiny wellies and jump up and down—everyone loves jumping in muddy puddles!",
    victoryBlurb: "Splish splash splosh! What a tremendous puddle jump!",
    goalDescription: "Jump in 6 muddy puddles",
    goalTarget: 6,
    stampId: 'stamp_muddy_boots',
    stampEmoji: '👢',
    stampName: 'Muddy Boots Stamp',
    stampColor: '#E57373',
    nodeBgColor: '#FFEBEE'
  },
  {
    index: 7,
    id: 'stop_8_car_wash',
    modeId: 'CAR_WASH',
    chapterId: 3,
    title: "Soapy Bubble Car Wash",
    subtitle: "Scrub rainbow suds clean",
    storyBlurb: "All that puddle splashing made the car muddy! Grab the sponge, whip up sparkling suds, and wash the car until it sparkles like new!",
    victoryBlurb: "Squeaky clean! The car shines like a diamond!",
    goalDescription: "Scrub the car 100% clean",
    goalTarget: 1,
    stampId: 'stamp_shiny_car',
    stampEmoji: '🚗',
    stampName: 'Shiny Car Stamp',
    stampColor: '#26C6DA',
    nodeBgColor: '#E0F7FA'
  },
  {
    index: 8,
    id: 'stop_9_dinosaur_balloon',
    modeId: 'DINOSAUR_BALLOON',
    chapterId: 3,
    title: "Dinosaur Balloon Chase",
    subtitle: "Pop floating dinosaur balloons",
    storyBlurb: "George and Leo's dinosaur balloons are floating into the breeze! Tap quickly to pop them with cheerful pops before they fly away!",
    victoryBlurb: "POP POP POP! You caught all the dinosaur balloons!",
    goalDescription: "Pop 8 colorful balloons",
    goalTarget: 8,
    stampId: 'stamp_dinosaur_balloon',
    stampEmoji: '🎈',
    stampName: 'Dino Balloon Stamp',
    stampColor: '#9575CD',
    nodeBgColor: '#EDE7F6'
  },

  // Chapter 4: Grandpa's Garden & Train
  {
    index: 9,
    id: 'stop_10_vegetable_harvest',
    modeId: 'VEGETABLE_HARVEST',
    chapterId: 4,
    title: "Grandpa's Veggie Harvest",
    subtitle: "Pull giant garden veggies",
    storyBlurb: "Grandpa Pig is in his organic vegetable garden! Heave, tug, and pull with all your might to harvest giant golden carrots and plump turnips!",
    victoryBlurb: "POP! A colossal golden vegetable pulled from the soil!",
    goalDescription: "Pull 3 giant veggies",
    goalTarget: 3,
    stampId: 'stamp_giant_carrot',
    stampEmoji: '🥕',
    stampName: 'Giant Carrot Stamp',
    stampColor: '#AED581',
    nodeBgColor: '#F1F8E9'
  },
  {
    index: 10,
    id: 'stop_11_rainbow_garden',
    modeId: 'RAINBOW_GARDEN',
    chapterId: 4,
    title: "Magic Rainbow Flowers",
    subtitle: "Water giant colorful blossoms",
    storyBlurb: "Take the magic watering can to the flower patch! Sprinkle water over little sprouts to watch giant rainbow flowers bloom and sway!",
    victoryBlurb: "Blossom magic! The garden is full of vibrant colors!",
    goalDescription: "Bloom 3 rainbow flowers",
    goalTarget: 3,
    stampId: 'stamp_rainbow_bloom',
    stampEmoji: '🌸',
    stampName: 'Rainbow Bloom Stamp',
    stampColor: '#7CB342',
    nodeBgColor: '#F9FBE7'
  },
  {
    index: 11,
    id: 'stop_12_little_train',
    modeId: 'LITTLE_TRAIN',
    chapterId: 4,
    title: "Grandpa's Little Train",
    subtitle: "Toot-toot through the valley",
    storyBlurb: "All aboard Gertrude the miniature steam train! Blow the shiny brass whistle and pick up all your friends for a countryside ride!",
    victoryBlurb: "Toot toot! Gertrude safely arrived at the station!",
    goalDescription: "Pick up 3 cheerful passengers",
    goalTarget: 3,
    stampId: 'stamp_train_conductor',
    stampEmoji: '🚂',
    stampName: 'Conductor Whistle Stamp',
    stampColor: '#42A5F5',
    nodeBgColor: '#E3F2FD'
  },

  // Chapter 5: Sunny Park & Windy Castle
  {
    index: 12,
    id: 'stop_13_hopscotch_bubble',
    modeId: 'HOPSCOTCH_BUBBLE',
    chapterId: 5,
    title: "Rainbow Bubble Hopscotch",
    subtitle: "Hop steps & pop soap bubbles",
    storyBlurb: "The train arrived at the sunny park! Hop along colorful number stones and pop magical floating rainbow bubbles with Mimi the bunny!",
    victoryBlurb: "Hop hop hop! You reached the end of the rainbow track!",
    goalDescription: "Complete 1 hopscotch round",
    goalTarget: 1,
    stampId: 'stamp_bubble_popper',
    stampEmoji: '🫧',
    stampName: 'Bubble Popper Stamp',
    stampColor: '#F06292',
    nodeBgColor: '#FCE4EC'
  },
  {
    index: 13,
    id: 'stop_14_ice_cream_van',
    modeId: 'ICE_CREAM_VAN',
    chapterId: 5,
    title: "Miss Bunny's Ice Cream Van",
    subtitle: "Stack a sweet tower feast",
    storyBlurb: "Ding-dong-ding! Miss Bunny's ice cream truck has arrived! Tap to stack sweet scoops of strawberry, vanilla, and mint as high as the sky!",
    victoryBlurb: "Delicious! A mouth-watering ice cream masterpiece!",
    goalDescription: "Stack 4 tasty scoops",
    goalTarget: 4,
    stampId: 'stamp_ice_cream_cone',
    stampEmoji: '🍦',
    stampName: 'Ice Cream Cone Stamp',
    stampColor: '#EC407A',
    nodeBgColor: '#F8BBD0'
  },
  {
    index: 14,
    id: 'stop_15_duck_picnic',
    modeId: 'DUCK_PICNIC',
    chapterId: 5,
    title: "Lakeside Duck Picnic",
    subtitle: "Feed & dance with the ducks",
    storyBlurb: "Spread the checkered blanket by the sparkling lake! Toss yummy breadcrumbs from the picnic basket to our quacking duck friends!",
    victoryBlurb: "Quack quack! The ducks are dancing for joy!",
    goalDescription: "Feed 6 happy ducks",
    goalTarget: 6,
    stampId: 'stamp_duck_quacker',
    stampEmoji: '🦆',
    stampName: 'Duck Quacker Stamp',
    stampColor: '#FBC02D',
    nodeBgColor: '#FFF9C4'
  },
  {
    index: 15,
    id: 'stop_16_windy_kite',
    modeId: 'WINDY_KITE',
    chapterId: 5,
    title: "Grand Finale at Windy Castle",
    subtitle: "Fly kites into the sunset sky",
    storyBlurb: "We reached the peak of Windy Castle! Catch the swooping breeze, steer your kite through the clouds, and collect sparkling evening stars!",
    victoryBlurb: "Hooray! You flew to the clouds and completed The Grand Journey!",
    goalDescription: "Fly your kite for 15 seconds",
    goalTarget: 15,
    stampId: 'stamp_windy_castle_master',
    stampEmoji: '🪁',
    stampName: 'Windy Castle Master Stamp',
    stampColor: '#FFA726',
    nodeBgColor: '#FFF8E1'
  }
];

export function getStoryStopByIndex(index: number): StoryStopDef | undefined {
  return STORY_STOPS[index];
}

export function getStoryStopByModeId(modeId: GameModeId): StoryStopDef | undefined {
  return STORY_STOPS.find(s => s.modeId === modeId);
}

export function getNextStoryStop(currentIndex: number): StoryStopDef | undefined {
  if (currentIndex + 1 < STORY_STOPS.length) {
    return STORY_STOPS[currentIndex + 1];
  }
  return undefined;
}

export function getChapterByStopIndex(stopIndex: number): StoryChapter | undefined {
  const stop = STORY_STOPS[stopIndex];
  if (!stop) return undefined;
  return STORY_CHAPTERS.find(c => c.id === stop.chapterId);
}
