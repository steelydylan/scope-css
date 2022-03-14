import slugify from 'slugify'
import escaper from 'escaper/src/escaper.js'
import stripComments from 'strip-css-comments'

export function scopeCSS(css: string, parent: string, o?: string) {
  if (!css) return css

  if (!parent) return css

  let option: { keyframes: string | boolean } = { keyframes: false }

  if (typeof o === 'string') {
    option = { keyframes: o }
  }
  if (!o) {
    option = { keyframes: false }
  }

  css = replace(css, parent + ' $1$2')

  //regexp.escape
  const parentRe = parent.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')

  //replace self-selectors
  css = css.replace(new RegExp('(' + parentRe + ')\\s*\\1(?=[\\s\\r\\n,{])', 'g'), '$1')

  //replace `:host` with parent
  css = css.replace(new RegExp('(' + parentRe + ')\\s*:host', 'g'), '$1')

  //revoke wrongly replaced @ statements, like @supports, @import, @media etc.
  css = css.replace(new RegExp('(' + parentRe + ')\\s*@', 'g'), '@')

  //revoke wrongly replaced :root blocks
  css = css.replace(new RegExp('(' + parentRe + ')\\s*:root', 'g'), ':root')

  //animations: prefix animation anmes
  const animations = []
  const animationNameRe = /@keyframes\s+([a-zA-Z0-9_-]+)\s*{/g;
  let match: RegExpExecArray | null;
  while ((match = animationNameRe.exec(css)) !== null) {
    if (animations.indexOf(match[1]) < 0) {
      animations.push(match[1])
    }
  }

  const slug = slugify(parent)

  animations.forEach(function (name) {
    const newName = (option.keyframes === true ? slug + '-' : typeof option.keyframes === 'string' ? option.keyframes : '') + name
    css = css.replace(new RegExp('(@keyframes\\s+)' + name + '(\\s*{)', 'g'),
      '$1' + newName + '$2')
    css = css.replace(new RegExp('(animation(?:-name)?\\s*:[^;]*\\s*)' + name + '([\\s;}])', 'g'),
      '$1' + newName + '$2')
  })
  //animation: revoke wrongly replaced keyframes
  css = css.replace(new RegExp('(' + parentRe + ' )(\\s*(?:to|from|[+-]?(?:(?:\\.\\d+)|(?:\\d+(?:\\.\\d*)?))%))(?=[\\s\\r\\n,{])', 'g'), '$2')

  return css
}

export function replace(css: string, replacer: string) {
  const arr: string[] = []

  css = stripComments(css)

  // escape strings etc.
  css = escaper.replace(css, true, arr)

  css = css.replace(/([^\r\n,{}]+)(,(?=[^}]*{)|\s*{)/g, replacer)

  // insert comments, strings etc. back
  css = escaper.paste(css, arr)

  return css
}
